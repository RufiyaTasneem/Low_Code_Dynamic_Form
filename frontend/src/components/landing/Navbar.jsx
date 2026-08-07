import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";
import "./Navbar.css";

const navLinks = [
    { key: "Features", href: "#features" },
    { key: "How It Works", href: "#workflow" },
    { key: "Templates", href: "#templates" },
    { key: "Pricing", href: "#pricing" },
    { key: "About", href: "#about" },
    { key: "Contact", href: "#contact" },
];

export default function Navbar() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="landing-navbar">
            <div className="landing-nav-shell">
                <a className="brand" href="#top">
                    <span className="brand-icon">
                        <Sparkles size={18} />
                    </span>
                    <span>LowCode Form Builder</span>
                </a>

                <nav className="nav-links">
                    {navLinks.map((link) => (
                        <a key={link.key} href={link.href}>
                            {t(link.key)}
                        </a>
                    ))}
                </nav>

                <div className="nav-actions">
                    <LanguageSwitcher />

                    <Link to="/login" className="nav-link-button">
                        {t("Sign In")}
                    </Link>

                    <Link to="/register" className="nav-cta">
                        {t("Get Started Free")}
                    </Link>
                </div>

                <button
                    className="menu-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {isOpen && (
                <div className="mobile-nav">
                    {navLinks.map((link) => (
                        <a
                            key={link.key}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                        >
                            {t(link.key)}
                        </a>
                    ))}
                </div>
            )}
        </header>
    );
}