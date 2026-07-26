import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

export default function Login() {
    const navigate = useNavigate();

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

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Welcome Back 👋</h2>

                {error && <p className="error">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                    />

                    <button type="submit">
                        Login
                    </button>
                </form>

                <p>
                    Don't have an account?
                </p>

                <button onClick={() => navigate("/register")}>
                    Register
                </button>
            </div>
        </div>
    );
}