import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {GoogleLogin} from "@react-oauth/google";

import {useLanguage} from "../LanguageContext";
import {backendLogin, fetchUserLogin} from "../auth";


export default function LoginPage() {
  const navigate = useNavigate();
  const { t, changeLanguage, currentLanguage } = useLanguage();
  const [justLoggedIn, setJustLoggedIn] = useState<boolean>(false);

  const handleLoginSuccess = async (credentialResponse: any) => {
    backendLogin(credentialResponse, setJustLoggedIn);
  };

  const handleLoginError = () => {
    console.log("Google login failed");
  };

  useEffect(() => {
    fetchUserLogin(navigate);
  }, [justLoggedIn]);

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
