import { Blocks, BrainCircuit, BarChart3, Download, Smartphone, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import "./Features.css";

const features = [
    {
        icon: Blocks,
        titleKey: "Drag & Drop Builder",
        descKey: "Create polished forms visually with a low-code surface that feels effortless.",
    },
    {
        icon: BrainCircuit,
        titleKey: "Conditional Logic",
        descKey: "Show or hide questions based on answers to make each flow smarter.",
    },
    {
        icon: BarChart3,
        titleKey: "Advanced Analytics",
        descKey: "Turn response data into clear trends, charts, and actionable insights.",
    },
    {
        icon: Download,
        titleKey: "Export Data",
        descKey: "Download results and share them with your team in a few clicks.",
    },
    {
        icon: Smartphone,
        titleKey: "Mobile Friendly",
        descKey: "Every form feels native on desktop, tablet, and mobile.",
    },
    {
        icon: ShieldCheck,
        titleKey: "Secure & Reliable",
        descKey: "Keep your workflows safe with privacy-first forms and dependable delivery.",
    },
];

export default function Features() {
    const { t } = useTranslation();

    return (
        <section id="features" className="features-section">
            <div className="section-heading">
                <span className="section-tag">{t("Features")}</span>
                <h2>{t("Everything you need to launch fast")}</h2>
                <p>{t("Design, automate, analyze, and scale without writing a lot of code.")}</p>
            </div>

            <div className="feature-grid">
                {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <article key={feature.titleKey} className="feature-card">
                            <div className="feature-icon">
                                <Icon size={22} />
                            </div>
                            <h3>{t(feature.titleKey)}</h3>
                            <p>{t(feature.descKey)}</p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
