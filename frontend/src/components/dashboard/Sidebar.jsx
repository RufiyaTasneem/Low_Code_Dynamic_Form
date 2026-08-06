import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (

        <aside className="sidebar">

            <div className="logo">

                <div className="logo-icon">
                    ✨
                </div>

                <div>
                    <h2>Form Studio</h2>
                    <p>Dynamic Builder</p>
                </div>

            </div>

            <nav>

                <NavLink to="/dashboard">
                    Dashboard
                </NavLink>

                <NavLink to="/forms">
                    Forms
                </NavLink>

                <NavLink to="/builder">
                    Builder
                </NavLink>
                <NavLink to="/audit-logs">
                    Audit Logs
                </NavLink>
            </nav>

            <button
                className="logout-btn"
                onClick={logout}
            >
                <LogOut size={18} />
                Logout
            </button>

        </aside>

    );

}