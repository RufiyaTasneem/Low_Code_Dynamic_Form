import "./Footer.css";

const columns = [
    {
        title: "Product",
        links: ["Features", "Templates", "Pricing", "Integrations"],
    },
    {
        title: "Resources",
        links: ["Docs", "Guides", "Support", "Status"],
    },
    {
        title: "Company",
        links: ["About", "Careers", "Contact", "Blog"],
    },
];

export default function Footer() {
    return (
        <footer id="contact" className="landing-footer">
            <div className="footer-grid">
                <div className="footer-brand">
                    <h3>LowCode Form Builder</h3>
                    <p>Modern forms, dynamic logic, and insight-driven experiences for modern teams.</p>
                    <div className="social-links">
                        <a href="#" aria-label="Twitter">𝕏</a>
                        <a href="#" aria-label="LinkedIn">in</a>
                        <a href="#" aria-label="Instagram">IG</a>
                        <a href="#" aria-label="Send">✉</a>
                    </div>
                </div>

                {columns.map((column) => (
                    <div key={column.title} className="footer-column">
                        <h4>{column.title}</h4>
                        <ul>
                            {column.links.map((link) => (
                                <li key={link}><a href="#">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div className="footer-newsletter">
                    <h4>Newsletter</h4>
                    <p>Get product updates and launch tips every month.</p>
                    <form className="newsletter-form">
                        <input type="email" placeholder="Email address" />
                        <button type="submit">Join</button>
                    </form>
                </div>
            </div>

            <div className="footer-bottom">
                <span>© 2026 LowCode Form Builder. All rights reserved.</span>
            </div>
        </footer>
    );
}
