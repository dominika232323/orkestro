import TopBar from "../components/TopBar";
import { useTranslation } from "react-i18next";

export default function MainPage() {
  const { t: translationObject, i18n } = useTranslation();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <>
      <TopBar
        handleLanguageChange={handleLanguageChange}
        translationObject={translationObject}
      />
    </>
  );
}
