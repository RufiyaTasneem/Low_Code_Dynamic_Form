function FieldCard({ field, onSelect, selectedLanguage = "en" }) {
    const getFieldIcon = (type) => {
        const icons = {
            text: "📝",
            email: "📧",
            number: "🔢",
            dropdown: "🔽",
            checkbox: "☑️",
            date: "📅",
            file: "📁",
            rating: "⭐",
            textarea: "🗒️",
        };

        return icons[type] || "✦";
    };

    const resolveLabel = (value, language = selectedLanguage) => {
        if (typeof value === "string") {
            return value;
        }

        return value?.[language] || value?.en || "";
    };

    return (
        <div
            className="field-card"
            onClick={() => onSelect(field)}
        >
            <div className="field-card-icon" aria-hidden="true">
                {getFieldIcon(field.type)}
            </div>
            <div>
                <h3>{resolveLabel(field.label, selectedLanguage)}</h3>
                <p>{field.type}</p>
            </div>
        </div>
    );
}

export default FieldCard;