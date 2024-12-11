import React, { createContext, useContext } from "react";
import i18n, { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

interface LanguageContextProps {
  t: TFunction; // Translation function
  changeLanguage: (language: string) => void; // Function to change the language
  currentLanguage: string; // Current language
}

// Create the context
const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
);

// LanguageProvider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <LanguageContext.Provider
      value={{
        t,
        changeLanguage,
        currentLanguage: i18n.language,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the LanguageContext
export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
