import { ArrowRight, Sparkles } from "lucide-react";
import "./Hero.css";

const featurePills = [
    "No credit card required",
    "Secure & Private",
    "Setup in less than 1 minute",
];

export default function Hero() {
    return (
        <section className="hero-section" id="top">
            <div className="hero-copy">
                <div className="hero-badge">
                    <Sparkles size={16} />
                    <span>The smartest way to build forms</span>
                </div>

                <h1>
                    Create Forms. <br />
                    Collect Responses. <br />
                    <span>Get Insights.</span>
                </h1>

                <p>
                    Build powerful dynamic forms in minutes, share anywhere, collect responses,
                    and uncover insights with a polished low-code workflow.
                </p>

                <div className="hero-actions">
                    <a href="#get-started" className="btn btn-primary">
                        Get Started Free <ArrowRight size={18} />
                    </a>
                    <a href="#demo" className="btn btn-secondary">
                        View Live Demo
                    </a>
                </div>

                <div className="hero-pills">
                    {featurePills.map((pill) => (
                        <span key={pill} className="pill">
                            {pill}
                        </span>
                    ))}
                </div>
            </div>

            <div className="hero-visual">
                <div className="builder-card">
                    <div className="builder-toolbar">
                        <div className="toolbar-tabs">
                            <span className="active">Builder</span>
                            <span>Settings</span>
                            <span>Preview</span>
                        </div>
                        <div className="toolbar-actions">
                            <span>Share</span>
                            <span className="publish">Publish</span>
                        </div>
                    </div>

                    <div className="builder-body">
                        <aside className="field-panel">
                            <h3>Fields</h3>
                            <ul>
                                {[
                                    "Short Text",
                                    "Long Text",
                                    "Dropdown",
                                    "Multiple Choice",
                                    "Checkbox",
                                    "Rating",
                                    "Date",
                                    "Email",
                                    "Phone Number",
                                    "File Upload",
                                ].map((field) => (
                                    <li key={field}>{field}</li>
                                ))}
                            </ul>
                        </aside>

                        <div className="preview-panel">
                            <div className="preview-top">
                                <span className="preview-badge">Live Preview</span>
                            </div>
                            <div className="form-card">
                                <label>Name</label>
                                <input type="text" placeholder="Enter your name" />
                                <label>How would you rate this experience?</label>
                                <div className="stars" aria-label="Rating stars">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <span key={index}>★</span>
                                    ))}
                                </div>
                                <label>What do you need help with?</label>
                                <textarea rows="3" placeholder="Type your thoughts..." />
                                <button type="button">Submit</button>
                            </div>
                        </div>

                        <aside className="properties-panel">
                            <h3>Properties</h3>
                            <label>
                                Field Label
                                <input type="text" defaultValue="Name" />
                            </label>
                            <label>
                                Field Type
                                <input type="text" defaultValue="Text" />
                            </label>
                            <label className="toggle-row">
                                Required
                                <input type="checkbox" defaultChecked />
                            </label>
                            <label>
                                Max Rating
                                <input type="number" defaultValue="5" />
                            </label>
                            <label>
                                Color
                                <input type="color" defaultValue="#5B5EF6" />
                            </label>
                        </aside>
                    </div>
                </div>
            </div>
        </section>
    );
}

