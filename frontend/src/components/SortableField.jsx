import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableField({ field, index, fieldTypes, onEdit, onDelete, isLocked }) {
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...dragProps}
            className="canvas-field"
        >
            <h3>Field #{index + 1}</h3>

            <div className="form-group">
                <label>Label</label>
                <input type="text" value={field.label} readOnly />
            </div>

            <div className="form-group">
                <label>Type</label>
                <input type="text" value={field.type} readOnly />
            </div>

            {Object.entries(field.config || {}).map(([key, value]) => (
                <div className="form-group" key={key}>
                    <label>{key}</label>
                    <input type="text" value={String(value)} readOnly />
                </div>
            ))}

            <button
                type="button"
                className="edit-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(field);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={isLocked}
            >
                Edit
            </button>

            <button
                type="button"
                className="delete-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(field.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={isLocked}
            >
                Delete
            </button>
        </div>
    );
}

export default SortableField;