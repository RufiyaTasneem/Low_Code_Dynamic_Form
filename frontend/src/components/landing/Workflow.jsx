import { PencilRuler, Share2, BarChart3, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import "./Workflow.css";

const steps = [
    { icon: PencilRuler, titleKey: "Create Form", descKey: "Pick fields, adjust settings, and shape your flow in minutes." },
    { icon: Share2, titleKey: "Share Form", descKey: "Publish securely and share links instantly across any channel." },
    { icon: BarChart3, titleKey: "Collect Responses", descKey: "Gather structured submissions from customers, teams, and leads." },
    { icon: Sparkles, titleKey: "Analyze Results", descKey: "Reveal trends, automate follow-ups, and inform decisions." },
];

export default function Workflow() {
    const { t } = useTranslation();

    return (
        <section id="workflow" className="workflow-section">
            <div className="section-heading">
                <span className="section-tag">{t("How It Works")}</span>
                <h2>{t("A smooth path from idea to insight")}</h2>
            </div>

            <div className="timeline">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <article key={step.titleKey} className="timeline-step">
                            <div className="timeline-icon">
                                <Icon size={18} />
                            </div>
                            <div className="timeline-content">
                                <span className="step-number">0{index + 1}</span>
                                <h3>{t(step.titleKey)}</h3>
                                <p>{t(step.descKey)}</p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
