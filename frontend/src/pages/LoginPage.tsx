import {useEffect, useState} from "react";
import {GoogleLogin} from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";

import {useLanguage} from "../LanguageContext";
import {getAccessToken, getRefreshToken, storeTokens, axiosInstance as axios} from "../auth";
import {User} from "../interfaces";


export default function LoginPage() {
  const { t, changeLanguage, currentLanguage } = useLanguage();
  const [justLoggedIn, setJustLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      const access_token = getAccessToken();
      const refresh_token = getRefreshToken();
      if (access_token || refresh_token) {
        await axios.get<User>("/api/users/me/")
          .then((response) => {
            console.log("Logged in as:", response.data)
            window.location.href = "/main-page";
          })
          .catch((error) => console.error("Error fetching user data:", error));
      }
    }

    fetchUser();
  }, [justLoggedIn]);

  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
      const credential = credentialResponse.credential;
      const decoded: any = jwtDecode(credentialResponse.credential);
      console.log("Google login successful:", decoded);

      await axios.post(
        "/api/login-google/",
        {"credential": credential}
      )
      .then((backendResponse) => {
        const {access_token, refresh_token} = backendResponse.data;
        storeTokens(access_token, refresh_token);
        setJustLoggedIn(true);
        console.log("Backend login successful:", backendResponse.data);
      })
      .catch((error) => console.error("Backend login failed:", error));

    } catch (error) {
      console.error("Error decoding JWT:", error);
    }
  };

  const handleLoginError = () => {
    console.log("Google login failed");
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Orkestro</h1>
        <p className="text-gray-600 mb-6">{t("login-page.description")}</p>

        <div className="flex justify-center items-center">
          <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} />
        </div>

        <div className="mt-4">
          <label
            htmlFor="language-select"
            className="block text-sm text-gray-600 mb-1"
          >
            {t("login-page.select-language")}
          </label>
          <select
            id="language-select"
            className="bg-white border border-gray-300 rounded-md text-sm p-2 w-full"
            onChange={(e) => changeLanguage(e.target.value)}
            value={currentLanguage}
          >
            <option value="pl">🇵🇱 Polski</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
      </div>
    </div>
  );
}
