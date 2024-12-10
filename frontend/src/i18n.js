import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import pl from "./locales/pl/translation.json";

i18n
  .use(initReactI18next) // Integracja z React
  .init({
    resources: {
      en: { translation: en },
      pl: { translation: pl },
    },
    fallbackLng: "pl", // Domyślny język
    interpolation: { escapeValue: false }, // React nie wymaga escapingu
  });

export default i18n;
