import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import "./LanguageSwitcher.css";

const languages = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
    { code: "te", name: "Telugu", native: "తెలుగు" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
    { code: "ml", name: "Malayalam", native: "മലയാളം" },
    { code: "mr", name: "Marathi", native: "मराठी" },
    { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
    { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
    { code: "bn", name: "Bengali", native: "বাংলা" },
    { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
    { code: "as", name: "Assamese", native: "অসমীয়া" },
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        i18n.changeLanguage(lang);
        localStorage.setItem("selectedLanguage", lang);
        localStorage.setItem("i18nextLng", lang);
    };

    return (
        <div className="language-switcher">
            <Globe size={18} className="lang-icon" />
            <select
                value={i18n.language || "en"}
                onChange={handleLanguageChange}
                className="language-select"
                aria-label="Select Application Language"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.native})
                    </option>
                ))}
            </select>
        </div>
    );
}
