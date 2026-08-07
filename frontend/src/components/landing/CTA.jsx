import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import "./CTA.css";

export default function CTA() {
    const { t } = useTranslation();

    return (
        <section id="get-started" className="cta-section">
            <div className="cta-card">
                <h2>{t("Ready to build your first form?")}</h2>
                <p>{t("Launch dynamic forms with streamlined logic, analytics, and beautiful sharing in minutes.")}</p>
                <div className="cta-actions">
                    <a href="#top" className="btn btn-primary">
                        {t("Get Started Free")} <ArrowRight size={18} />
                    </a>
                    <a href="#demo" className="btn btn-secondary">
                        {t("View Demo")}
                    </a>
                </div>
            </div>
        </section>
    );
}
