import { ArrowRight } from "lucide-react";
import "./CTA.css";

export default function CTA() {
    return (
        <section id="get-started" className="cta-section">
            <div className="cta-card">
                <h2>Ready to build your first form?</h2>
                <p>Launch dynamic forms with streamlined logic, analytics, and beautiful sharing in minutes.</p>
                <div className="cta-actions">
                    <a href="#top" className="btn btn-primary">
                        Get Started Free <ArrowRight size={18} />
                    </a>
                    <a href="#demo" className="btn btn-secondary">
                        View Demo
                    </a>
                </div>
            </div>
        </section>
    );
}
