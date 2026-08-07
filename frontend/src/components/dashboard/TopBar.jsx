import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";

export default function TopBar({
    title = "Dashboard",
    subtitle = "",
    showButton = false,
}) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="topbar">
            <div>
                <h2>{t(title)}</h2>
                <p>{subtitle ? t(subtitle) : ""}</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <LanguageSwitcher />

                {showButton && (
                    <button
                        className="create-btn"
                        onClick={() => navigate("/builder")}
                    >
                        + {t("Create Form")}
                    </button>
                )}
            </div>
        </div>
    );
}