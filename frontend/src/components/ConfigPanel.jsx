import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { resolveText } from "../utils/translationUtils";

const normalizeOptions = (options) => {
    if (!options) return [];
    let list = options;
    if (typeof list === "string") {
        list = list.split(/[,\n]+/).map((s) => (s ?? "").trim()).filter(Boolean);
    }
    if (!Array.isArray(list)) return [];

    return list.map((opt) => {
        if (!opt) return { value: "", label: { en: "" } };

        if (typeof opt === "string") {
            try {
                const parsed = JSON.parse(opt);
                if (typeof parsed === "object" && parsed !== null && (parsed.value || parsed.label || parsed.en)) {
                    const val = parsed.value || parsed.label?.en || parsed.en || "";
                    const labelObj = (parsed.label && typeof parsed.label === "object")
                        ? { ...parsed.label }
                        : { en: typeof parsed.label === "string" ? parsed.label : (parsed.en || val) };
                    return { value: val, label: labelObj };
                }
            } catch (e) {
                // Plain string
            }
            return { value: opt, label: { en: opt } };
        }

        if (typeof opt === "object" && opt !== null) {
            const val = opt.value || opt.label?.en || opt.en || "";
            let labelObj = {};
            if (opt.label && typeof opt.label === "object") {
                labelObj = { ...opt.label };
            } else if (typeof opt.label === "string") {
                labelObj = { en: opt.label };
            } else {
                labelObj = { en: val };
            }
            return { value: val, label: labelObj };
        }

        return { value: String(opt), label: { en: String(opt) } };
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
    const { t } = useTranslation();
    const [labelData, setLabelData] = useState({ en: "", te: "" });
    const [config, setConfig] = useState({});

    useEffect(() => {
        if (editingField) {
            const l = editingField.label;
            const lObj = typeof l === "object" && l !== null ? l : { en: typeof l === "string" ? l : "", te: "" };
            setLabelData({ en: lObj.en || "", te: lObj.te || lObj.en || "" });
            setConfig(editingField.config || {});
        } else {
            const l = selectedField?.label;
            const lObj = typeof l === "object" && l !== null ? l : { en: typeof l === "string" ? l : "", te: "" };
            setLabelData({ en: lObj.en || "", te: lObj.te || lObj.en || "" });
            setConfig({});
        }
    }, [editingField, selectedField]);

    const fieldDefinition = editingField?.definition || selectedField;

    if (!fieldDefinition) {
        return (
            <div className="no-selection">
                <h2>{t("Select a field from the left panel")}</h2>
            </div>
        );
    }

    const parseListValues = (value) => {
        if (value === undefined || value === null || value === "") {
            return [];
        }

        return String(value ?? "")
            .split(/[,\n]+/)
            .map((item) => (item ?? "").trim())
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
                    return;
                }
                const rawValue = normalized[item.name];
                normalized[item.name] = parseListValues(rawValue);
            });

        return normalized;
    };

    const handleChange = (key, value, type) => {
        let updatedValue = value;

        if (type === "number") {
            updatedValue = value === "" ? "" : Number(value);
        } else if (type === "boolean") {
            updatedValue = Boolean(value);
        }

        const nextConfig = {
            ...config,
            [key]: updatedValue,
        };

        setConfig(nextConfig);
    };

    const handleOptionsTextChange = (textValue) => {
        const lines = String(textValue ?? "").split("\n").map((s) => (s ?? "").trim()).filter(Boolean);
        const nextOptions = lines.map((line) => ({
            value: line,
            label: { en: line, te: line },
        }));
        handleChange("options", nextOptions, "list");
    };

    const handleSave = () => {
        const finalConfig = normalizeConfig(config);

        if (editingField) {
            onUpdateField(editingField.id, labelData, finalConfig);
        } else {
            onAddField(selectedField, labelData, finalConfig);
        }
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

        if (item.name === "options") {
            const normOpts = normalizeOptions(currentValue);
            const optionsText = normOpts.map((opt) => opt.label?.en || opt.value || "").join("\n");

            return (
                <textarea
                    rows={4}
                    placeholder="Enter options (one per line)...&#10;e.g. Yes&#10;No&#10;Maybe"
                    value={optionsText}
                    disabled={isLocked}
                    onChange={(e) => handleOptionsTextChange(e.target.value)}
                />
            );
        }

        if (item.name === "placeholder" || item.name === "help_text" || item.name === "validation_message") {
            const raw = currentValue;
            const strVal = typeof raw === "object" && raw !== null ? raw.en || "" : (raw ?? "");

            const placeholderText = item.name === "validation_message"
                ? "Enter validation message (e.g. This field is required)"
                : item.name === "help_text"
                ? "Enter help text / description"
                : "Enter placeholder text";

            return (
                <input
                    type="text"
                    placeholder={placeholderText}
                    value={strVal}
                    disabled={isLocked}
                    onChange={(e) => {
                        const val = e.target.value;
                        const prevObj = typeof raw === "object" && raw !== null ? raw : {};
                        handleChange(item.name, { ...prevObj, en: val, te: prevObj.te || val }, item.type);
                    }}
                />
            );
        }

        if (item.type === "list") {
            return (
                <textarea
                    rows={3}
                    placeholder={`Enter ${item.label || "list items"} (one per line)...`}
                    value={formatListValue(currentValue)}
                    disabled={isLocked}
                    onChange={(e) => handleChange(item.name, parseListValues(e.target.value), item.type)}
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

    const hasValidationMsgInConfig = (fieldDefinition.config || []).some(
        (item) => item.name === "validation_message"
    );

    const rawValMsg = config.validation_message;
    const strValMsg = typeof rawValMsg === "object" && rawValMsg !== null ? rawValMsg.en || "" : (rawValMsg ?? "");

    return (
        <div>
            <h2>
                {editingField
                    ? t("Edit Field")
                    : `${resolveText(fieldDefinition?.label, "en") || fieldDefinition?.type || "Field"} Configuration`}
            </h2>

            {/* Field Label Input */}
            <div className="form-group">
                <label>{t("Label")}</label>
                <input
                    type="text"
                    placeholder={t("Enter field label")}
                    value={labelData.en || ""}
                    disabled={isLocked}
                    onChange={(e) => {
                        const val = e.target.value;
                        setLabelData((prev) => ({ ...prev, en: val, te: prev.te || val }));
                    }}
                />
            </div>

            {(fieldDefinition.config || []).map((item) => (
                <div className="form-group" key={item.name}>
                    {item.name !== "placeholder" && item.name !== "help_text" && item.name !== "validation_message" && item.name !== "options" && (
                        <label>{t(item.label)}</label>
                    )}
                    {item.name === "placeholder" && <label>{t("Placeholder")}</label>}
                    {item.name === "help_text" && <label>{t("Help Text")}</label>}
                    {item.name === "validation_message" && <label>{t("Validation Message")}</label>}
                    {item.name === "options" && <label>{t("Option Labels (one per line)")}</label>}
                    {renderConfigInput(item)}
                </div>
            ))}

            {!hasValidationMsgInConfig && (
                <div className="form-group">
                    <label>{t("Validation Message")}</label>
                    <input
                        type="text"
                        placeholder="e.g. This field is required"
                        value={strValMsg}
                        disabled={isLocked}
                        onChange={(e) => {
                            const val = e.target.value;
                            const prevObj = typeof rawValMsg === "object" && rawValMsg !== null ? rawValMsg : {};
                            handleChange("validation_message", { ...prevObj, en: val, te: prevObj.te || val }, "text");
                        }}
                    />
                </div>
            )}

            {isLocked && (
                <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: 10 }}>
                    Published versions are locked. Switch to a draft version to edit fields.
                </p>
            )}

            <button
                className="primary-btn"
                onClick={handleSave}
                style={{ marginTop: 20, width: "100%" }}
                disabled={isLocked}
            >
                {editingField ? t("Save Changes") : t("Add Field")}
            </button>
        </div>
    );
}

export default ConfigPanel;