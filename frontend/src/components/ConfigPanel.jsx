import { useState, useEffect } from "react";

const defaultLabelValue = { en: "", te: "" };

function ConfigPanel({
    selectedField,
    editingField,
    setEditingField,
    onAddField,
    onUpdateField,
    isLocked,
    selectedLanguage,
}) {
    const [labelData, setLabelData] = useState(defaultLabelValue);
    const [config, setConfig] = useState({});

    const normalizeLabelValue = (value) => {
        if (!value) {
            return { ...defaultLabelValue };
        }

        if (typeof value === "string") {
            return { en: value, te: "" };
        }

        return {
            en: value?.en || "",
            te: value?.te || "",
        };
    };

    const resolveLabel = (value, language = selectedLanguage) => {
        if (typeof value === "string") {
            return value;
        }

        return value?.[language] || value?.en || "";
    };

    useEffect(() => {
        if (editingField) {
            setLabelData(normalizeLabelValue(editingField.label));
            setConfig(editingField.config || {});
        } else {
            setLabelData(normalizeLabelValue(selectedField?.label));
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
            label: {
                en: labelData.en || "",
                te: labelData.te || "",
            },
            type: fieldDefinition?.type,
            config: normalizedConfig,
        };

        onAddField(fieldData);

        setLabelData({ ...defaultLabelValue });
        setConfig({});
    };

    const handleUpdate = () => {
        if (isLocked) return;

        onUpdateField({
            id: editingField.id,
            label: {
                en: labelData.en || "",
                te: labelData.te || "",
            },
            config,
        });

        setEditingField(null);
        setLabelData({ ...defaultLabelValue });
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
                    : `${resolveLabel(fieldDefinition?.label, selectedLanguage) || fieldDefinition?.type || "Field"} Configuration`}
            </h2>

            <div className="form-group">
                <label>English Label</label>
                <input
                    type="text"
                    value={labelData.en}
                    disabled={isLocked}
                    onChange={(e) =>
                        setLabelData((prev) => ({ ...prev, en: e.target.value }))
                    }
                    placeholder="Enter English label"
                />
            </div>

            <div className="form-group">
                <label>Telugu Label</label>
                <input
                    type="text"
                    value={labelData.te}
                    disabled={isLocked}
                    onChange={(e) =>
                        setLabelData((prev) => ({ ...prev, te: e.target.value }))
                    }
                    placeholder="Enter Telugu label"
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