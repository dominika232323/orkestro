import { useTranslation } from "react-i18next";
import React from "react";

export default function LoginPage() {
  const { t: translationObject, i18n } = useTranslation();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <>
      <h1>Orkestro</h1>
      <p>{translationObject("login-page.description")}</p>
      <a href="/main-page">{translationObject("login-page.login")}</a>
      <select
        className="bg-white border border-gray-300 rounded-md text-sm p-1"
        onChange={handleLanguageChange}
      >
        <option value="pl">🇵🇱 Polski</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </>
  );
}
