import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import "../components/auth/Auth.css";
import { login } from "../services/authService";

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await login(form);

            if (data.role === "admin") {
                navigate("/dashboard");
            } else {
                navigate("/builder");
            }
        } catch (err) {
            const detail = err.response?.data?.detail;

            if (Array.isArray(detail)) {
                setError(detail[0].msg);
            } else {
                setError(detail || "Login Failed");
            }
        }
    };

    const handleSignInClick = (e) => {
        e.preventDefault();
        e.currentTarget.form?.requestSubmit();
    };

    return (
        <div className="auth-page">
            <AuthLayout
                title="Welcome back"
                subtitle="Sign in to continue to your account"
                footerText="Don't have an account?"
                footerLinkText="Sign Up"
                footerHref="/register"
            >
                {error && <p className="error">{error}</p>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <input
                        className="password-input"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <div className="auth-options">
                        <label>
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <a href="#">Forgot password?</a>
                    </div>

                    <button className="auth-submit-btn" type="submit" onClick={handleSignInClick}>
                        Sign In
                    </button>
                </form>

                <div className="auth-divider">or</div>

                <button className="auth-secondary-btn" type="button" onClick={() => navigate("/register")}>
                    Create an account
                </button>
            </AuthLayout>
        </div>
    );
}