import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "fr" : "EN");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-2 border border-white rounded-full hover:bg-white hover:text-black transition text-sm"
      aria-label="Toggle Language"
    >
      {language === "EN" ? "FR" : "EN"}
    </button>
  );
}
