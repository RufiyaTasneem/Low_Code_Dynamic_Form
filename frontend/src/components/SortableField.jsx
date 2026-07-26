import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableField({ field, index, fieldTypes, onEdit, onDelete, isLocked, rules = [], }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: field.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: isLocked ? "default" : "grab",
    };

    const dragProps = isLocked ? {} : { ...attributes, ...listeners };
    const hasRule = rules.some(
        (rule) =>
            rule.trigger_field_id === field.id ||
            rule.target_field_id === field.id
    );
    const getFieldIcon = (type) => {
        const icons = {
            text: "📝",
            email: "📧",
            number: "🔢",
            date: "📅",
            textarea: "🗒️",
            dropdown: "🔽",
            checkbox: "☑️",
            file: "📁",
            rating: "⭐",
        };

        return icons[type] || "✦";
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...dragProps}
            className="canvas-field"
        >
            <div className="canvas-field-main">
                <div className="canvas-field-drag">
                    <span className="drag-handle">⋮⋮</span>
                    <span className="field-icon" aria-hidden="true">
                        {getFieldIcon(field.type)}
                    </span>
                </div>

                <div className="canvas-field-content">
                    <h3>
                        {field.label || `Field ${index + 1}`}
                        {hasRule && (
                            <span className="rule-badge">
                                ⚡ Rule
                            </span>
                        )}
                    </h3>
                    <p>{field.type || "field"}</p>
                </div>

                <div className="canvas-field-actions">
                    <button
                        type="button"
                        className="canvas-action-btn edit-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(field);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        disabled={isLocked}
                        aria-label="Edit field"
                    >
                        ✏️
                    </button>

                    <button
                        type="button"
                        className="canvas-action-btn delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(field.id);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        disabled={isLocked}
                        aria-label="Delete field"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SortableField;