function FieldCard({ field, onSelect }) {
    return (
        <div
            className="field-card"
            onClick={() => onSelect(field)}
        >
            <h3>{field.label}</h3>
            <p>{field.type}</p>
        </div>
    );
}

export default FieldCard;