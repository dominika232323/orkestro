import { TFunction } from "i18next";

export default interface LanguageProps {
  translationObject: TFunction;
  handleLanguageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}
