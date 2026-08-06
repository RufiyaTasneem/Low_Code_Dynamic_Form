import { useState, useEffect } from "react";

const defaultLabelValue = { en: "", te: "" };

const normalizeOptions = (options) => {
    if (!options) return [];
    let list = options;
    if (typeof list === "string") {
        list = list.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(list)) return [];

    return list.map((opt) => {
        if (!opt) return { value: "", label: { en: "", te: "" } };

        if (typeof opt === "string") {
            try {
                const parsed = JSON.parse(opt);
                if (typeof parsed === "object" && parsed !== null && (parsed.value || parsed.label || parsed.en)) {
                    const val = parsed.value || parsed.label?.en || parsed.en || "";
                    const enLabel = (parsed.label && typeof parsed.label === "object")
                        ? (parsed.label.en || val)
                        : (typeof parsed.label === "string" ? parsed.label : (parsed.en || val));
                    const teLabel = (parsed.label && typeof parsed.label === "object")
                        ? (parsed.label.te || enLabel)
                        : (parsed.te || enLabel);
                    return {
                        value: val,
                        label: { en: enLabel, te: teLabel }
                    };
                }
            } catch (e) {
                // Plain string
            }
            return {
                value: opt,
                label: { en: opt, te: opt }
            };
        }

        if (typeof opt === "object" && opt !== null) {
            const val = opt.value || opt.label?.en || opt.en || opt.te || "";
            const enLabel = (opt.label && typeof opt.label === "object")
                ? (opt.label.en || val)
                : (typeof opt.label === "string" ? opt.label : (opt.en || val));
            const teLabel = (opt.label && typeof opt.label === "object")
                ? (opt.label.te || enLabel)
                : (opt.te || enLabel);

            return {
                value: val,
                label: { en: enLabel, te: teLabel }
            };
        }

        return {
            value: String(opt),
            label: { en: String(opt), te: String(opt) }
        };
    });
};

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
                if (item.name === "options") {
                    normalized[item.name] = normalizeOptions(normalized[item.name]);
                } else {
                    normalized[item.name] = parseListValues(normalized[item.name]);
                }
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

        if (item.name === "options") {
            const normOptions = normalizeOptions(config[item.name]);

            const enText = normOptions.map((opt) => opt.label.en || opt.value).join("\n");
            const teText = normOptions.map((opt) => opt.label.te || opt.label.en || opt.value).join("\n");

            const handleMultilingualOptionsChange = (newEnText, newTeText) => {
                const enLines = String(newEnText || "")
                    .split("\n")
                    .map((s) => s.trim());
                const teLines = String(newTeText || "")
                    .split("\n")
                    .map((s) => s.trim());

                const maxLen = Math.max(enLines.length, teLines.length);
                const nextOptions = [];

                for (let i = 0; i < maxLen; i++) {
                    const enVal = enLines[i] || "";
                    const teVal = teLines[i] || "";
                    if (enVal || teVal) {
                        const rawVal = enVal || teVal;
                        nextOptions.push({
                            value: rawVal,
                            label: {
                                en: enVal || teVal,
                                te: teVal || enVal,
                            },
                        });
                    }
                }

                handleChange(item.name, nextOptions, item.type);
            };

            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            English Options (one option per line)
                        </label>
                        <textarea
                            rows={4}
                            placeholder={"yes\nno\nmaybe"}
                            value={enText}
                            disabled={isLocked}
                            onChange={(e) => handleMultilingualOptionsChange(e.target.value, teText)}
                        />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            Telugu Options (one option per line)
                        </label>
                        <textarea
                            rows={4}
                            placeholder={"అవును\nలేదు\nబహుశా"}
                            value={teText}
                            disabled={isLocked}
                            onChange={(e) => handleMultilingualOptionsChange(enText, e.target.value)}
                        />
                    </div>
                </div>
            );
        }

        if (item.name === "placeholder") {
            const raw = config[item.name];
            const placeholderObj =
                typeof raw === "object" && raw !== null
                    ? raw
                    : { en: typeof raw === "string" ? raw : "", te: "" };

            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input
                        type="text"
                        placeholder="English Placeholder"
                        value={placeholderObj.en || ""}
                        disabled={isLocked}
                        onChange={(e) =>
                            handleChange(
                                item.name,
                                { ...placeholderObj, en: e.target.value },
                                item.type
                            )
                        }
                    />
                    <input
                        type="text"
                        placeholder="Telugu Placeholder"
                        value={placeholderObj.te || ""}
                        disabled={isLocked}
                        onChange={(e) =>
                            handleChange(
                                item.name,
                                { ...placeholderObj, te: e.target.value },
                                item.type
                            )
                        }
                    />
                </div>
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