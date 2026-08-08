import { translations } from "../constants/translations";

export const translate = (text, language = "en") => {
    if (text === undefined || text === null) return "";

    let key = text;

    // Handle multilingual object e.g. { en: "Email", te: "ఇమెయిల్" }
    if (typeof text === "object" && text !== null) {
        if (text[language] && String(text[language]).trim() !== "") {
            return String(text[language]);
        }
        if (text.en && String(text.en).trim() !== "") {
            key = text.en;
        } else {
            const firstKey = Object.keys(text)[0];
            if (firstKey && text[firstKey]) return String(text[firstKey]);
            return "";
        }
    } else if (typeof text === "string") {
        const trimmed = text.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
                const parsed = JSON.parse(text);
                if (typeof parsed === "object" && parsed !== null) {
                    if (parsed[language] && String(parsed[language]).trim() !== "") {
                        return String(parsed[language]);
                    }
                    if (parsed.en && String(parsed.en).trim() !== "") {
                        key = parsed.en;
                    }
                }
            } catch (e) {
                // Keep key as string
            }
        }
    }

    const strKey = String(key ?? "").trim();
    if (!strKey) return "";

    // 1. Look up in dictionary for target language
    const langDict = translations[language] || {};
    if (langDict[strKey] !== undefined && langDict[strKey] !== null) {
        return langDict[strKey];
    }

    // 2. Look up in English dictionary
    const enDict = translations.en || {};
    if (enDict[strKey] !== undefined && enDict[strKey] !== null) {
        return enDict[strKey];
    }

    // 3. Return original text fallback
    return String(key);
};

export const getTranslatedText = (text, selectedLanguage = "en") => {
    return translate(text, selectedLanguage);
};

export const resolveText = (value, language = "en") => {
    return translate(value, language);
};

export const resolveFieldLabel = (field, language = "en") => {
    if (!field) return "";
    const resolved = translate(field?.label, language);
    return resolved || (field.id ? `Field ${field.id}` : "");
};

export const resolvePlaceholder = (placeholder, language = "en") => {
    return translate(placeholder, language);
};

export const resolveHelpText = (helpText, language = "en") => {
    return translate(helpText, language);
};

export const resolveOptionLabel = (opt, language = "en") => {
    if (opt === undefined || opt === null) return "";
    if (typeof opt === "string") {
        const trimmed = (opt ?? "").trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
                const parsed = JSON.parse(opt);
                return translate(parsed, language);
            } catch (e) {
                return translate(opt, language);
            }
        }
        return translate(opt, language);
    }

    if (typeof opt === "object" && opt !== null) {
        if (opt.label) {
            const resolved = translate(opt.label, language);
            if (resolved) return resolved;
        }
        const textFromObj = translate(opt, language);
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

export const normalizeSingleOption = (opt) => {
    if (opt === undefined || opt === null) return { value: "", label: { en: "" } };

    if (typeof opt === "string") {
        const trimmed = opt.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return normalizeSingleOption(parsed[0]);
                }
                return normalizeSingleOption(parsed);
            } catch (e) {
                // Ignore parse error, return as string
            }
        }
        return { value: trimmed, label: { en: trimmed } };
    }

    if (typeof opt === "object" && opt !== null) {
        let val = "";
        if (opt.value !== undefined && opt.value !== null) {
            val = String(opt.value);
        } else if (opt.label && typeof opt.label === "object") {
            val = opt.label.en || Object.values(opt.label)[0] || "";
        } else if (typeof opt.label === "string") {
            val = opt.label;
        } else if (opt.en) {
            val = opt.en;
        }

        let labelObj = {};
        if (opt.label && typeof opt.label === "object") {
            labelObj = { ...opt.label };
            if (!labelObj.en && val) labelObj.en = val;
        } else if (typeof opt.label === "string") {
            labelObj = { en: opt.label };
        } else if (opt.en || opt.te || opt.hi || opt.ta) {
            labelObj = { en: opt.en || val, te: opt.te, hi: opt.hi, ta: opt.ta };
        } else {
            labelObj = { en: val };
        }

        return {
            value: val,
            label: labelObj,
        };
    }

    return { value: String(opt), label: { en: String(opt) } };
};

export const normalizeOptions = (options) => {
    if (!options) return [];
    let list = options;

    if (typeof list === "string") {
        const trimmed = list.trim();
        if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
            try {
                list = JSON.parse(trimmed);
            } catch (e) {
                list = trimmed.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
            }
        } else {
            list = trimmed.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
        }
    }

    if (!Array.isArray(list)) {
        if (typeof list === "object" && list !== null) {
            list = [list];
        } else if (typeof list === "string") {
            list = list.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
        } else {
            return [];
        }
    }

    const expandedList = [];
    for (const item of list) {
        if (typeof item === "string") {
            const trimmedItem = item.trim();
            if (trimmedItem.startsWith("{") || trimmedItem.startsWith("[")) {
                try {
                    const parsed = JSON.parse(trimmedItem);
                    if (Array.isArray(parsed)) {
                        expandedList.push(...parsed);
                        continue;
                    }
                } catch (e) {
                    // Fallthrough
                }
            }
            if (trimmedItem.includes(",")) {
                const parts = trimmedItem.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
                expandedList.push(...parts);
            } else if (trimmedItem) {
                expandedList.push(trimmedItem);
            }
        } else if (item !== undefined && item !== null) {
            expandedList.push(item);
        }
    }

    return expandedList.map(normalizeSingleOption);
};

export const resolveOptionDisplayLabel = (option, language = "en") => {
    if (!option) return "";
    const normalized = normalizeSingleOption(option);
    return translate(normalized.label, language) || normalized.value;
};

export const resolveOptionValue = (option) => {
    if (!option) return "";
    const normalized = normalizeSingleOption(option);
    return normalized.value;
};
