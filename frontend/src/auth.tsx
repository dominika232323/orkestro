import axios from "axios";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";

import {User} from "./interfaces";


const LOGIN_PAGE: string = "/login/";
const REDIRECT_AFTER_LOGIN: string = "/invitations-and-groups/";

const ACCESS_TOKEN_LIFETIME: number = 1 / 24  // 1 hour
const REFRESH_TOKEN_LIFETIME: number = 1  // 1 day

export function getAccessToken() {
    return Cookies.get("access_token")
}

export function getRefreshToken() {
    return Cookies.get("refresh_token")
}

export function setAccessToken(access_token: string) {
    Cookies.set("access_token", access_token, {expires: ACCESS_TOKEN_LIFETIME});
}

export function setRefreshToken(refresh_token: string) {
    Cookies.set("refresh_token", refresh_token, {expires: REFRESH_TOKEN_LIFETIME});
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
                        "/api/token-refresh/",
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

export const backendLogin = async (credentialResponse: any, setJustLoggedIn: Function = (_: any) => {}) => {
    try {
        const credential = credentialResponse.credential;
        const decoded: any = jwtDecode(credentialResponse.credential);
        console.log("Google login successful:", decoded);

        await axios.post(
            "/api/google-login/",
            {"credential": credential}
        )
        .then((backendResponse) => {
            const {access_token, refresh_token} = backendResponse.data;
            storeTokens(access_token, refresh_token);
            console.log("Backend login successful:", backendResponse.data);
            setJustLoggedIn(true);
        })
        .catch((error) => console.error("Backend login failed:", error));

    } catch (error) {
        console.error("Error decoding JWT:", error);
    }
}

export const fetchUserLogin = async (navigate: Function) => {
    const access_token = getAccessToken();
    const refresh_token = getRefreshToken();

    if (access_token || refresh_token) {
        await axiosInstance.get<User>("/api/users/me/")
            .then((response) => {
                console.log("Logged in as:", response.data)
                navigate(REDIRECT_AFTER_LOGIN);
            })
            .catch((error) => console.error("Error fetching user data:", error));
    }
}

export const fetchUserOrRedirect = async (navigate: Function, setUser: Function = (_: any) => {}) => {
    const access_token = getAccessToken();
    const refresh_token = getRefreshToken();
    if (access_token || refresh_token) {
        await axiosInstance.get<User>("/api/users/me/")
            .then((response) => {
                setUser(response.data);
            })
            .catch((error) => {
                console.error("Error fetching user data, redirecting to login:", error)
                window.location.href = LOGIN_PAGE;
            });
    }
    else {
        console.error("No tokens, redirecting to login")
        window.location.href = LOGIN_PAGE;
    }
}
