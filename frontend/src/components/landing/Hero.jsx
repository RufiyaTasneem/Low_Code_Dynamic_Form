import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import "./Hero.css";

const featurePills = [
    "No credit card required",
    "Secure & Private",
    "Setup in less than 1 minute",
];

export default function Hero() {
    const { t } = useTranslation();

    return (
        <section className="hero-section" id="top">
            <div className="hero-copy">
                <div className="hero-badge">
                    <Sparkles size={16} />
                    <span>{t("The smartest way to build forms")}</span>
                </div>

                <h1>
                    {t("Create Forms.")} <br />
                    {t("Collect Responses.")} <br />
                    <span>{t("Get Insights.")}</span>
                </h1>

                <p>
                    {t("Build powerful dynamic forms in minutes, share anywhere, collect responses, and uncover insights with a polished low-code workflow.")}
                </p>

                <div className="hero-actions">
                    <a href="#get-started" className="btn btn-primary">
                        {t("Get Started Free")} <ArrowRight size={18} />
                    </a>
                    <a href="#demo" className="btn btn-secondary">
                        {t("View Live Demo")}
                    </a>
                </div>

                <div className="hero-pills">
                    {featurePills.map((pill) => (
                        <span key={pill} className="pill">
                            {t(pill)}
                        </span>
                    ))}
                </div>
            </div>

            <div className="hero-visual">
                <div className="builder-card">
                    <div className="builder-toolbar">
                        <div className="toolbar-tabs">
                            <span className="active">{t("Builder")}</span>
                            <span>{t("Settings")}</span>
                            <span>{t("Preview Form")}</span>
                        </div>
                        <div className="toolbar-actions">
                            <span>{t("Shareable Link")}</span>
                            <span className="publish">{t("Publish")}</span>
                        </div>
                    </div>

                    <div className="builder-body">
                        <aside className="field-panel">
                            <h3>{t("Field Types")}</h3>
                            <ul>
                                {[
                                    "Text",
                                    "Number",
                                    "Dropdown",
                                    "Checkbox",
                                    "Radio",
                                    "Date",
                                    "Email",
                                ].map((field) => (
                                    <li key={field}>{t(field)}</li>
                                ))}
                            </ul>
                        </aside>

                        <div className="preview-panel">
                            <div className="preview-top">
                                <span className="preview-badge">{t("Live Preview")}</span>
                            </div>
                            <div className="form-card">
                                <label>{t("Full Name")}</label>
                                <input type="text" placeholder="Enter your name" />
                                <label>How would you rate this experience?</label>
                                <div className="stars" aria-label="Rating stars">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <span key={index}>★</span>
                                    ))}
                                </div>
                                <label>{t("Message")}</label>
                                <textarea rows="3" placeholder="Type your thoughts..." />
                                <button type="button">{t("Submit")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
