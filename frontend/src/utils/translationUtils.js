export const getTranslatedText = (text, selectedLanguage = "en") => {
    if (text === undefined || text === null) return "";
    return resolveText(text, selectedLanguage);
};

export const resolveText = (value, language = "en") => {
    if (value === undefined || value === null) return "";

    let obj = value;

    if (typeof value === "string") {
        const trimmed = (value ?? "").trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
                obj = JSON.parse(value);
            } catch (e) {
                return value;
            }
        } else {
            return value;
        }
    }

    if (typeof obj === "object" && obj !== null) {
        // 1. Target language
        const targetVal = obj[language];
        if (targetVal !== undefined && targetVal !== null && String(targetVal).trim() !== "") {
            return String(targetVal);
        }
        // 2. Fall back to English ("en")
        const enVal = obj.en;
        if (enVal !== undefined && enVal !== null && String(enVal).trim() !== "") {
            return String(enVal);
        }
        // 3. Fall back to first available non-empty translation
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (val !== undefined && val !== null && String(val).trim() !== "") {
                return String(val);
            }
        }
        return "";
    }

    return String(value ?? "");
};

export const resolveFieldLabel = (field, language = "en") => {
    if (!field) return "";
    const resolved = resolveText(field?.label, language);
    return resolved || (field.id ? `Field ${field.id}` : "");
};

export const resolvePlaceholder = (placeholder, language = "en") => {
    return resolveText(placeholder, language);
};

export const resolveHelpText = (helpText, language = "en") => {
    return resolveText(helpText, language);
};

export const resolveOptionLabel = (opt, language = "en") => {
    if (opt === undefined || opt === null) return "";
    if (typeof opt === "string") {
        const trimmed = (opt ?? "").trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
                const parsed = JSON.parse(opt);
                return resolveText(parsed, language);
            } catch (e) {
                return opt;
            }
        }
        return opt;
    }

    if (typeof opt === "object" && opt !== null) {
        if (opt.label) {
            const resolved = resolveText(opt.label, language);
            if (resolved) return resolved;
        }
        const textFromObj = resolveText(opt, language);
        if (textFromObj) return textFromObj;
        return opt.value ?? "";
    }

    return String(opt ?? "");
};

export const normalizeMultilingualObject = (value) => {
    if (value === undefined || value === null) return { en: "" };
    if (typeof value === "string") {
        const trimmed = (value ?? "").trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
                const parsed = JSON.parse(value);
                if (typeof parsed === "object" && parsed !== null) {
                    return { en: "", ...parsed };
                }
            } catch (e) {
                // Ignore
            }
        }
        return { en: value };
    }
    if (typeof value === "object" && value !== null) {
        return { en: "", ...value };
    }
    return { en: String(value ?? "") };
};

export const ensureTranslationObject = (value) => {
    if (value === undefined || value === null) return { en: "" };
    if (typeof value === "object" && value !== null) {
        return { en: "", ...value };
    }
    return { en: String(value) };
};

export const formatFieldPayload = (fieldData) => {
    if (!fieldData) return fieldData;

    const labelObj = ensureTranslationObject(fieldData.label);
    const config = { ...(fieldData.config || {}) };

    if ("placeholder" in config) {
        config.placeholder = ensureTranslationObject(config.placeholder);
    }
    if ("help_text" in config) {
        config.help_text = ensureTranslationObject(config.help_text);
    }
    if ("validation_message" in config) {
        config.validation_message = ensureTranslationObject(config.validation_message);
    }

    if ("options" in config && Array.isArray(config.options)) {
        config.options = config.options.map((opt) => {
            if (typeof opt === "string") {
                return {
                    value: opt,
                    label: { en: opt },
                };
            }
            if (typeof opt === "object" && opt !== null) {
                const val = opt.value || opt.label?.en || opt.en || "";
                let labelObj = {};
                if (opt.label && typeof opt.label === "object") {
                    labelObj = { en: "", ...opt.label };
                } else if (typeof opt.label === "string") {
                    labelObj = { en: opt.label };
                } else {
                    labelObj = { en: val };
                }
                return {
                    value: val,
                    label: labelObj,
                };
            }
            return {
                value: String(opt),
                label: { en: String(opt) },
            };
        });
    }

    return {
        ...fieldData,
        label: labelObj,
        config: config,
    };
};
