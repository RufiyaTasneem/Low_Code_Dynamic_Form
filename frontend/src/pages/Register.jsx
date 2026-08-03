import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import "../components/auth/Auth.css";
import { register } from "../services/authService";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
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

    const parseErrorMessage = (err) => {
        const detail = err?.response?.data?.detail;

        if (typeof detail === "string") {
            return detail;
        }

        if (Array.isArray(detail)) {
            return detail
                .map((item) => {
                    if (typeof item === "string") return item;
                    if (item?.msg) return `${item.loc?.join(".") || "field"}: ${item.msg}`;
                    return JSON.stringify(item);
                })
                .join("\n");
        }

        if (detail && typeof detail === "object") {
            if (detail?.msg) {
                return `${detail.loc?.join(".") || "field"}: ${detail.msg}`;
            }
            return JSON.stringify(detail);
        }

        if (err?.message === "Network Error") {
            return "Network Error: unable to reach backend. Confirm the API URL and backend server are running.";
        }

        return err?.response?.data?.message || err?.message || "Registration Failed";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await register(form);

            navigate("/login", {
                state: {
                    message: "Account created successfully. Please sign in.",
                },
            });
        } catch (err) {
            setError(parseErrorMessage(err));
        }
    };

    return (
        <div className="auth-page">
            <AuthLayout
                title="Create your account"
                subtitle="Start building forms in minutes."
                footerText="Already have an account?"
                footerLinkText="Sign In"
                footerHref="/login"
            >
                {error && <p className="error">{error}</p>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Name"
                        value={form.username}
                        onChange={handleChange}
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <div className="password-row">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button className="auth-submit-btn" type="submit">
                        Create Account
                    </button>
                </form>

                <div className="auth-divider">or</div>

                <button className="auth-secondary-btn" type="button" onClick={() => navigate("/login")}>
                    Back to Sign In
                </button>
            </AuthLayout>
        </div>
    );
}