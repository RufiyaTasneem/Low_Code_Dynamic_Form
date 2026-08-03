import { PencilRuler, Share2, BarChart3, Sparkles } from "lucide-react";
import "./Workflow.css";

const steps = [
    { icon: PencilRuler, title: "Create Form", description: "Pick fields, adjust settings, and shape your flow in minutes." },
    { icon: Share2, title: "Share Form", description: "Publish securely and share links instantly across any channel." },
    { icon: BarChart3, title: "Collect Responses", description: "Gather structured submissions from customers, teams, and leads." },
    { icon: Sparkles, title: "Analyze Results", description: "Reveal trends, automate follow-ups, and inform decisions." },
];

export default function Workflow() {
    return (
        <section id="workflow" className="workflow-section">
            <div className="section-heading">
                <span className="section-tag">How It Works</span>
                <h2>A smooth path from idea to insight</h2>
            </div>

            <div className="timeline">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <article key={step.title} className="timeline-step">
                            <div className="timeline-icon">
                                <Icon size={18} />
                            </div>
                            <div className="timeline-content">
                                <span className="step-number">0{index + 1}</span>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
