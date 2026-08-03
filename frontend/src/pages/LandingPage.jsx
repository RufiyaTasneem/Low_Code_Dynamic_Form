import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Workflow from "../components/landing/Workflow";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";
import "./LandingPage.css";

export default function LandingPage() {
    return (
        <div className="landing-page-shell">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <Workflow />
                <Testimonials />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}
