import LanguageProps from "../interfaces/LanguageProps";

export default function LoginPage({
  handleLanguageChange,
  translationObject,
}: LanguageProps) {
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
