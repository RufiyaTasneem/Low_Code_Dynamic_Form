function FieldCard({ field, onSelect }) {
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

    return (
        <div
            className="field-card"
            onClick={() => onSelect(field)}
        >
            <div className="field-card-icon" aria-hidden="true">
                {getFieldIcon(field.type)}
            </div>
            <div>
                <h3>{field.label}</h3>
                <p>{field.type}</p>
            </div>
        </div>
    );
}

export default FieldCard;