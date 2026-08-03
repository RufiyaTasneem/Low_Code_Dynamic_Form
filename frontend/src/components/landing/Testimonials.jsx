import "./Testimonials.css";

const testimonials = [
    {
        name: "Maya Chen",
        role: "Product Lead, Northstar",
        quote: "We launched a client intake funnel in a single afternoon. The builder feels premium and incredibly fast.",
    },
    {
        name: "Daniel Ortiz",
        role: "Operations Manager, Lumen",
        quote: "Conditional logic and analytics gave our team clarity instantly. The experience is polished from start to finish.",
    },
    {
        name: "Ava Brooks",
        role: "Founder, BrightLoop",
        quote: "It’s the first form tool that feels as powerful as our product. Everyone on the team loves it.",
    },
];

export default function Testimonials() {
    return (
        <section className="testimonials-section">
            <div className="section-heading">
                <span className="section-tag">Testimonials</span>
                <h2>Loved by teams shipping faster</h2>
            </div>

            <div className="testimonial-grid">
                {testimonials.map((testimonial) => (
                    <article key={testimonial.name} className="testimonial-card">
                        <div className="avatar">{testimonial.name.charAt(0)}</div>
                        <div className="testimonial-body">
                            <h3>{testimonial.name}</h3>
                            <p className="role">{testimonial.role}</p>
                            <p className="quote">“{testimonial.quote}”</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
