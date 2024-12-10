import TopBar from "../components/TopBar";
import { useTranslation } from "react-i18next";

export default function MainPage() {
  const { t: translationObject, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <>
      <TopBar
        changeLanguage={changeLanguage}
        translationObject={translationObject}
      />
    </>
  );
}
