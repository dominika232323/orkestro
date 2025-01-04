import React, { createContext, useContext, useEffect, useState } from "react";
import { TFunction } from "i18next";
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
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setCurrentLanguage(language);
    localStorage.setItem("appLanguage", language);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem("appLanguage") || i18n.language;
    i18n.changeLanguage(savedLanguage);
    setCurrentLanguage(savedLanguage);
  }, [i18n]);

  return (
    <LanguageContext.Provider
      value={{
        t,
        changeLanguage,
        currentLanguage,
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

export const LanguageSelector = () => {
  const { changeLanguage, currentLanguage } = useLanguage();

  return (
    <select
      className="bg-white border border-gray-300 rounded-md text-sm p-1"
      onChange={(e) => changeLanguage(e.target.value)}
      value={currentLanguage} // Reflect current language in the select
    >
      <option value="pl">🇵🇱 Polski</option>
      <option value="en">🇬🇧 English</option>
    </select>
  );
};
