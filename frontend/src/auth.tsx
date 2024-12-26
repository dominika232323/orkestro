import axios from "axios";
import Cookies from "js-cookie";


const access_token_lifetime: number = 0.020833  // 30 minutes
const refresh_token_lifetime: number = 1  // 1 day

export function getAccessToken() {
    return Cookies.get("access_token")
}

export function getRefreshToken() {
    return Cookies.get("refresh_token")
}

export function setAccessToken(access_token: string) {
    Cookies.set("access_token", access_token, {expires: access_token_lifetime});
}

export function setRefreshToken(refresh_token: string) {
    Cookies.set("refresh_token", refresh_token, {expires: refresh_token_lifetime});
}

export function storeTokens(access_token: string, refresh_token: string) {
    setAccessToken(access_token);
    setRefreshToken(refresh_token);
    console.log("Tokens stored in cookies successfully");
}

export function removeTokens() {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
}

// axios instance configured for JWT tokens
export const axiosInstance = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    const response = await axios.post(
                        `/api/token/refresh/`,
                        {refresh: refreshToken}
                    );
                    setAccessToken(response.data.access);
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
            }
        }
        return Promise.reject(error);
    }
);
