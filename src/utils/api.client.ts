import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
})

apiClient.interceptors.response.use(
    response => response
)

export default apiClient