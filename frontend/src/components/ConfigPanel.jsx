import { useState, useEffect } from "react";

function ConfigPanel({
    selectedField,
    editingField,
    setEditingField,
    onAddField,
    onUpdateField,
    isLocked,
}) {
    const [label, setLabel] = useState("");
    const [config, setConfig] = useState({});

    useEffect(() => {
        if (editingField) {
            setLabel(editingField.label || "");
            setConfig(editingField.config || {});
        } else {
            setLabel(selectedField?.label || "");
            setConfig({});
        }
    }, [editingField, selectedField]);

    const fieldDefinition = editingField?.definition || selectedField;

    if (!fieldDefinition) {
        return (
            <div className="no-selection">
                <h2>Select a field from the left panel</h2>
            </div>
        );
    }

    const handleChange = (name, value, type) => {
        setConfig((prev) => {
            const nextConfig = { ...prev };

            if (type === "boolean") {
                nextConfig[name] = Boolean(value);
            } else if (type === "list") {
                nextConfig[name] = value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);
            } else {
                nextConfig[name] = value;
            }

            return nextConfig;
        });
    };

    const handleAdd = () => {
        console.log("ConfigPanel handleAdd", {
            selectedField,
            label,
            config,
            isLocked,
        });

        if (isLocked) return;

        const fieldData = {
            label,
            type: selectedField.type,
            field_order: 1,
            config,
        };

        console.log("ConfigPanel sending fieldData", fieldData);
        onAddField(fieldData);

        setLabel("");
        setConfig({});
    };

    const handleUpdate = () => {
        if (isLocked) return;

        onUpdateField({
            id: editingField.id,
            label,
            config,
        });

        setEditingField(null);
        setLabel("");
        setConfig({});
    };

    const renderConfigInput = (item) => {
        const currentValue = config[item.name];

        if (item.type === "boolean") {
            return (
                <input
                    type="checkbox"
                    checked={Boolean(currentValue)}
                    onChange={(e) => handleChange(item.name, e.target.checked, item.type)}
                />
            );
        }

        if (item.type === "list") {
            return (
                <textarea
                    placeholder={item.label}
                    value={Array.isArray(currentValue) ? currentValue.join(", ") : currentValue || ""}
                    onChange={(e) => handleChange(item.name, e.target.value, item.type)}
                />
            );
        }

        if (item.type === "number") {
            return (
                <input
                    type="number"
                    placeholder={item.label}
                    value={currentValue ?? ""}
                    onChange={(e) => handleChange(item.name, e.target.value, item.type)}
                />
            );
        }

        if (item.type === "date") {
            return (
                <input
                    type="date"
                    placeholder={item.label}
                    value={currentValue ?? ""}
                    onChange={(e) => handleChange(item.name, e.target.value, item.type)}
                />
            );
        }

        return (
            <input
                type="text"
                placeholder={item.label}
                value={currentValue ?? ""}
                onChange={(e) => handleChange(item.name, e.target.value, item.type)}
            />
        );
    };

    return (
        <div>
            <h2>
                {editingField
                    ? "Edit Field"
                    : `${fieldDefinition.label || fieldDefinition.type || "Field"} Configuration`}
            </h2>

            <div className="form-group">
                <label>Field Label</label>
                <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Enter field label"
                />
            </div>

            {(fieldDefinition.config || []).map((item) => (
                <div className="form-group" key={item.name}>
                    <label>{item.label}</label>
                    {renderConfigInput(item)}
                </div>
            ))}

            {isLocked && (
                <p className="locked-message">
                    A published version is selected. Editing is disabled.
                </p>
            )}
            <button
                type="button"
                className="add-btn"
                onClick={editingField ? handleUpdate : handleAdd}
                disabled={isLocked}
            >
                {editingField ? "Update Field" : "Add Field"}
            </button>
        </div>
    );
}

export default ConfigPanel;