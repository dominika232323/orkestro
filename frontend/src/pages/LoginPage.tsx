import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import { LanguageSelector, useLanguage } from "../LanguageContext";
import { backendLogin, fetchUserLogin } from "../auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const [justLoggedIn, setJustLoggedIn] = useState<boolean>(false);

  const handleLoginSuccess = async (credentialResponse: any) => {
    backendLogin(credentialResponse, setJustLoggedIn);
  };

  useEffect(() => {
    fetchUserLogin(navigate);
  }, [navigate, justLoggedIn]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Orkestro</h1>
        <p className="text-gray-600 mb-6">{t("login-page.description")}</p>

        <div className="flex justify-center items-center">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            locale={currentLanguage}
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="language-select"
            className="block text-sm text-gray-600 mb-1"
          >
            {t("login-page.select-language")}:
          </label>
          <LanguageSelector />
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <a href="/privacy-policy/" className="text-blue-500 hover:underline">
            {t("privacy-policy.title")}
          </a>
        </div>
      </div>
    </div>
  );
}
