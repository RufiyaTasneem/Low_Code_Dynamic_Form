function FieldCard({ field, onSelect }) {
    return (
        <div
            onClick={() => onSelect(field)}
            style={{
                border: "1px solid gray",
                padding: "10px",
                margin: "10px",
                cursor: "pointer",
                borderRadius: "8px",
            }}
        >
            <h3>{field.label}</h3>
            <p>{field.type}</p>
        </div>
    );
}

export default FieldCard;