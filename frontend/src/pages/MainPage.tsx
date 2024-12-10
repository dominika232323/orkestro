import TopBar from "../components/TopBar";
import LanguageProps from "../interfaces/LanguageProps";

export default function MainPage({
  handleLanguageChange,
  translationObject,
}: LanguageProps) {
  return (
    <>
      <TopBar
        handleLanguageChange={handleLanguageChange}
        translationObject={translationObject}
      />
    </>
  );
}
