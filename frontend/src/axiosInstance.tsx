import axios from "axios";
import Cookies from "js-cookie";


const axiosInstance = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = Cookies.get("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = Cookies.get("refresh_token");
                if (refreshToken) {
                    const response = await axios.post(
                        `/api/token/refresh/`,
                        {refresh: refreshToken}
                    );
                    Cookies.set("access_token", response.data.access, {expires: 0.020833}); // 30 minutes
                    axiosInstance.defaults.headers.Authorization = `Bearer ${response.data.access}`;
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
