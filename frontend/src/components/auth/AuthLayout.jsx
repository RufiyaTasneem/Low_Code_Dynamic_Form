import { ArrowRight, Blocks, ChartNoAxesCombined, ShieldCheck, Share2, Sparkles } from "lucide-react";
import "./AuthLayout.css";

const featureCards = [
    {
        icon: Blocks,
        title: "Drag & Drop Builder",
        description: "Build forms easily with our intuitive interface.",
    },
    {
        icon: ChartNoAxesCombined,
        title: "Real-time Analytics",
        description: "Get insights instantly.",
    },
    {
        icon: ShieldCheck,
        title: "Secure & Reliable",
        description: "Encrypted and protected.",
    },
    {
        icon: Share2,
        title: "Share Anywhere",
        description: "Email, link or embed forms.",
    },
];

export default function AuthLayout({ children, title, subtitle, footerText, footerLinkText, footerHref }) {
    return (
        <div className="auth-shell">
            <div className="auth-hero-panel">
                <div className="auth-hero-inner">
                    <div className="brand-mark">
                        <Sparkles size={18} />
                        <span>LowCode Form Builder</span>
                    </div>

                    <h1>Build powerful forms. Collect responses. Get insights.</h1>
                    <p>
                        Create dynamic forms with ease, share anywhere, collect responses in real time,
                        analyze results with beautiful analytics.
                    </p>

                    <div className="feature-grid">
                        {featureCards.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.title} className="feature-card">
                                    <div className="feature-icon">
                                        <Icon size={16} />
                                    </div>
                                    <div>
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="auth-footer-copy">© 2026 LowCode Form Builder</div>
                </div>
            </div>

            <div className="auth-form-panel">
                <div className="auth-card">
                    <div className="auth-card-head">
                        <h2>{title}</h2>
                        <p>{subtitle}</p>
                    </div>
                    {children}
                    {footerText && footerLinkText && (
                        <div className="auth-footer-link">
                            <span>{footerText}</span>
                            <a href={footerHref}>{footerLinkText}</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
