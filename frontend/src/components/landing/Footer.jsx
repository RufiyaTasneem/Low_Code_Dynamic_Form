import { useTranslation } from "react-i18next";
import "./Footer.css";

const columns = [
    {
        titleKey: "Product",
        links: [
            { key: "Features", href: "#features" },
            { key: "Templates", href: "#templates" },
            { key: "Pricing", href: "#pricing" },
        ],
    },
    {
        titleKey: "Company",
        links: [
            { key: "About", href: "#about" },
            { key: "Contact", href: "#contact" },
        ],
    },
];

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer id="contact" className="landing-footer">
            <div className="footer-grid">
                <div className="footer-brand">
                    <h3>LowCode Form Builder</h3>
                    <p>{t("Modern forms, dynamic logic, and insight-driven experiences for modern teams.")}</p>
                    <div className="social-links">
                        <a href="#" aria-label="Twitter">𝕏</a>
                        <a href="#" aria-label="LinkedIn">in</a>
                        <a href="#" aria-label="Instagram">IG</a>
                        <a href="#" aria-label="Send">✉</a>
                    </div>
                </div>

                {columns.map((column) => (
                    <div key={column.titleKey} className="footer-column">
                        <h4>{t(column.titleKey)}</h4>
                        <ul>
                            {column.links.map((link) => (
                                <li key={link.key}><a href={link.href}>{t(link.key)}</a></li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div className="footer-newsletter">
                    <h4>{t("Newsletter")}</h4>
                    <p>{t("Get product updates and launch tips every month.")}</p>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder={t("Email address")} />
                        <button type="submit">{t("Join")}</button>
                    </form>
                </div>
            </div>

            <div className="footer-bottom">
                <span>© 2026 LowCode Form Builder. All rights reserved.</span>
            </div>
        </footer>
    );
}
