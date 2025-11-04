import axios from "axios";

// Get base URL based on environment
const getBaseURL = () => {
    // In production, always use the full backend URL
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://supersheet-backend.onrender.com';
    }
    // In development, use the env variable or default to localhost
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
};

const apiClient = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
})

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.data && error.response.data.error === "Access token missing in cookies") {
            if (typeof window !== 'undefined') {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
)

export default apiClient