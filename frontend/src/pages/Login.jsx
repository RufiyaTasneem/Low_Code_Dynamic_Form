import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/auth/AuthLayout";
import "../components/auth/Auth.css";
import { login } from "../services/authService";

export default function Login() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

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
                title={t("Login")}
                subtitle="Sign in to continue to your account"
                footerText="Don't have an account?"
                footerLinkText={t("Register")}
                footerHref="/register"
            >
                {error && <p className="error">{error}</p>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder={t("Email")}
                        value={form.email}
                        onChange={handleChange}
                    />

                    <input
                        className="password-input"
                        type="password"
                        name="password"
                        placeholder={t("Password")}
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
                        {t("Login")}
                    </button>
                </form>

                <div className="auth-divider">or</div>

                <button className="auth-secondary-btn" type="button" onClick={() => navigate("/register")}>
                    {t("Register")}
                </button>
            </AuthLayout>
        </div>
    );
}