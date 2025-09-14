import { createContext, useContext, useState, useEffect } from "react";
import i18n from "@/i18n"; // 👈 import i18n instance

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const storedLang = localStorage.getItem("language");
    if (storedLang) setLanguage(storedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
    i18n.changeLanguage(language); // 👈 this line syncs i18n with your state
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
