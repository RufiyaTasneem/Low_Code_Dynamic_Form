import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
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
            const response = await register(form);

            navigate("/submission-success", {
                state: {
                    responseId: response?.data?.response_id,
                    submittedAt: response?.data?.submitted_at,
                    formTitle: response?.data?.form_title,
                },
            });
        } catch (err) {
            setError(parseErrorMessage(err));
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h2>Create Account</h2>

                {error && <p className="error">{error}</p>}

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
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

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <button type="submit">
                        Register
                    </button>

                </form>

                <button type="button" onClick={() => navigate("/login")}>
                    Back to Login
                </button>

            </div>
        </div>
    );
}