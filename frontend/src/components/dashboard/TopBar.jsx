import { useNavigate } from "react-router-dom";

export default function TopBar({
    title = "Dashboard",
    subtitle = "",
    showButton = false,
}) {

    const navigate = useNavigate();

    return (

        <div className="topbar">

            <div>

                <h2>{title}</h2>

                <p>{subtitle}</p>

            </div>

            {showButton && (

                <button
                    className="create-btn"
                    onClick={() => navigate("/builder")}
                >
                    + Create Form
                </button>

            )}

        </div>

    );
}