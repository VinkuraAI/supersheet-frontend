import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:5000",
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