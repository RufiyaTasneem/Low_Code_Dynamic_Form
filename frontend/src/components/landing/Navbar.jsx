import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle.jsx";
import "./Navbar.css";

const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#workflow" },
    { label: "Templates", href: "#templates" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
];

export default function Navbar() {
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
                        <a key={link.label} href={link.href}>
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="nav-actions">
                    <ThemeToggle />

                    <Link to="/login" className="nav-link-button">
                        Sign In
                    </Link>

                    <Link to="/register" className="nav-cta">
                        Get Started Free
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
                            key={link.label}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            )}
        </header>
    );
}