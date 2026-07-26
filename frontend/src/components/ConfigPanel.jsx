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

    const parseListValues = (value) => {
        if (value === undefined || value === null || value === "") {
            return [];
        }

        return String(value)
            .split(/[,\n]+/)
            .map((item) => item.trim())
            .filter(Boolean);
    };

    const formatListValue = (value) => {
        if (Array.isArray(value)) {
            return value.join("\n");
        }

        return value ?? "";
    };

    const normalizeConfig = (nextConfig) => {
        const normalized = { ...nextConfig };

        (fieldDefinition.config || [])
            .filter((item) => item.type === "list")
            .forEach((item) => {
                normalized[item.name] = parseListValues(normalized[item.name]);
            });

        return normalized;
    };

    const handleChange = (name, value, type) => {
        setConfig((prev) => {
            const nextConfig = { ...prev };

            if (type === "boolean") {
                nextConfig[name] = Boolean(value);
            } else if (type === "list") {
                nextConfig[name] = value;
            } else {
                nextConfig[name] = value;
            }

            return nextConfig;
        });
    };

    const handleAdd = () => {
        if (isLocked) return;

        const normalizedConfig = normalizeConfig(config);

        const fieldData = {
            label,
            type: selectedField.type,
            field_order: 1,
            config: normalizedConfig,
        };

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
                    disabled={isLocked}
                    onChange={(e) => handleChange(item.name, e.target.checked, item.type)}
                />
            );
        }

        if (item.type === "list") {
            return (
                <textarea
                    placeholder={item.label}
                    value={formatListValue(currentValue)}
                    disabled={isLocked}
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
                    disabled={isLocked}
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
                    disabled={isLocked}
                    onChange={(e) => handleChange(item.name, e.target.value, item.type)}
                />
            );
        }

        return (
            <input
                type="text"
                placeholder={item.label}
                value={currentValue ?? ""}
                disabled={isLocked}
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
                    disabled={isLocked}
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