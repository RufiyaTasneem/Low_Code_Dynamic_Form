import { Blocks, BrainCircuit, BarChart3, Download, Smartphone, ShieldCheck } from "lucide-react";
import "./Features.css";

const features = [
    {
        icon: Blocks,
        title: "Drag & Drop Builder",
        description: "Create polished forms visually with a low-code surface that feels effortless.",
    },
    {
        icon: BrainCircuit,
        title: "Conditional Logic",
        description: "Show or hide questions based on answers to make each flow smarter.",
    },
    {
        icon: BarChart3,
        title: "Advanced Analytics",
        description: "Turn response data into clear trends, charts, and actionable insights.",
    },
    {
        icon: Download,
        title: "Export Data",
        description: "Download results and share them with your team in a few clicks.",
    },
    {
        icon: Smartphone,
        title: "Mobile Friendly",
        description: "Every form feels native on desktop, tablet, and mobile.",
    },
    {
        icon: ShieldCheck,
        title: "Secure & Reliable",
        description: "Keep your workflows safe with privacy-first forms and dependable delivery.",
    },
];

export default function Features() {
    return (
        <section id="features" className="features-section">
            <div className="section-heading">
                <span className="section-tag">Features</span>
                <h2>Everything you need to launch fast</h2>
                <p>Design, automate, analyze, and scale without writing a lot of code.</p>
            </div>

            <div className="feature-grid">
                {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <article key={feature.title} className="feature-card">
                            <div className="feature-icon">
                                <Icon size={22} />
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
