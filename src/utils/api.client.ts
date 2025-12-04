import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

let csrfTokenPromise: Promise<string | null> | null = null;

const getCsrfToken = () => {
    if (!csrfTokenPromise) {
        csrfTokenPromise = axios.get("/api/csrf-token", { withCredentials: true })
            .then(response => {
                apiClient.defaults.headers.common['x-csrf-token'] = response.data.csrfToken;
                return response.data.csrfToken;
            })
            .catch(error => {
                console.error("Failed to fetch CSRF token", error);
                delete apiClient.defaults.headers.common['x-csrf-token'];
                csrfTokenPromise = null; // Allow retrying
                return null;
            });
    }
    return csrfTokenPromise;
};

// Fetch token on startup to make it available for subsequent requests.
getCsrfToken();

apiClient.interceptors.request.use(async (config) => {
    // We only need to attach the token to state-changing methods.
    const methodsToProtect = ['post', 'put', 'delete', 'patch'];
    if (config.method && methodsToProtect.includes(config.method)) {
        // Wait for the token if it's being fetched.
        const token = await getCsrfToken();
        if (token) {
            config.headers['x-csrf-token'] = token;
        }
    }
    return config;
}, error => Promise.reject(error));


apiClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Handle CSRF token errors
        if (error.response?.status === 403 && !originalRequest._retry) {
            const methodsToProtect = ['post', 'put', 'delete', 'patch'];
            if (originalRequest.method && methodsToProtect.includes(originalRequest.method)) {
                originalRequest._retry = true;
                console.log("CSRF token validation failed; attempting to refresh and retry.");

                // Force a refetch of the CSRF token
                csrfTokenPromise = null;
                const newToken = await getCsrfToken();

                if (newToken) {
                    originalRequest.headers['x-csrf-token'] = newToken;
                    return apiClient(originalRequest);
                }
            }
        }

        // Handle missing access token or not authenticated error
        // We check for 401 status OR specific error messages
        if (error.response?.status === 401 ||
            error.response?.data?.error === "Access token missing in cookies" ||
            error.response?.data?.error === "Not authenticated") {

            if (typeof window !== 'undefined') {
                // Prevent redirect loop if already on auth page
                if (window.location.pathname.startsWith('/auth')) {
                    return Promise.reject(error);
                }

                // Only redirect if we are not already redirecting
                if (!window.location.search.includes('redirect=')) {
                    const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
                    window.location.href = `/auth?redirect=${redirectUrl}`;
                }
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;