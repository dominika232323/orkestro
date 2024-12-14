import { useLanguage } from "../LanguageContext";

export default function LoginPage() {
  const { t, changeLanguage, currentLanguage } = useLanguage();
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Orkestro</h1>
        <p className="text-gray-600 mb-6">{t("login-page.description")}</p>
        <a
          href="/main-page"
          className="inline-block bg-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition-colors mb-4"
        >
          {t("login-page.login")}
        </a>
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
