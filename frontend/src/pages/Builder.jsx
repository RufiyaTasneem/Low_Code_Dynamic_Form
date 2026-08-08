import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../app.css";
import API from "../services/api";
import {
    getFormVersions,
    publishFormApi,
    archiveFormApi,
    createNewDraftApi,
    getDraftApi,
    generateShareableLinkApi,
    getConditionalRulesApi,
    getRetentionPolicyApi,
    updateRetentionPolicyApi,
} from "../api/formApi";
import ConditionalRuleBuilder from "../components/ConditionalRuleBuilder";
import FieldPalette from "../components/FieldPalette";
import ConfigPanel from "../components/ConfigPanel";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { evaluateRulesApi } from "../api/formApi";
import SortableField from "../components/SortableField";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TopBar from "../components/dashboard/TopBar";
import {
    resolveText,
    resolveFieldLabel,
    resolvePlaceholder,
    normalizeOptions,
    resolveOptionDisplayLabel,
    resolveOptionValue,
} from "../utils/translationUtils";



const renderPreviewInput = (
    field,
    config,
    formValues,
    fieldStates,
    handleFieldChange,
    selectedLanguage = "en"
) => {
    const inputId = `field-${field.id}`;
    const isRequired = Boolean(config?.required || fieldStates?.[field.id]?.required);
    const resolvedPlaceholder = resolvePlaceholder(config?.placeholder, selectedLanguage) || resolveFieldLabel(field, selectedLanguage);

    if (field.type === "text") {
        return (
            <input
                id={inputId}
                type="text"
                placeholder={resolvedPlaceholder}
                value={formValues?.[field.id] || ""}
                required={isRequired}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
        );
    }

    if (field.type === "email") {
        return (
            <input
                id={inputId}
                type="email"
                placeholder={resolvedPlaceholder}
                value={formValues[field.id] || ""}
                required={isRequired}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
        );
    }

    if (field.type === "number") {
        return (
            <input
                id={inputId}
                type="number"
                min={config?.min}
                max={config?.max}
                value={formValues[field.id] || ""}
                required={isRequired}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
        );
    }

    if (field.type === "date") {
        return (
            <input
                id={inputId}
                type="date"
                value={formValues[field.id] || ""}
                required={isRequired}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
        );
    }

    if (field.type === "textarea") {
        return (
            <textarea
                id={inputId}
                placeholder={resolvedPlaceholder}
                value={formValues[field.id] || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
        );
    }

    if (field.type === "dropdown" || field.type === "select") {
        const rawOptions = normalizeOptions(config?.options);

        return (
            <select
                id={inputId}
                className="builder-preview-select"
                value={formValues[field.id] || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
                <option value="">
                    {resolvePlaceholder(config?.placeholder, selectedLanguage) || "Select..."}
                </option>
                {rawOptions.map((opt, idx) => {
                    const optVal = resolveOptionValue(opt);
                    const optLabel = resolveOptionDisplayLabel(opt, selectedLanguage);
                    return (
                        <option key={idx} value={optVal}>
                            {optLabel}
                        </option>
                    );
                })}
            </select>
        );
    }

    if (field.type === "radio") {
        const rawOptions = normalizeOptions(config?.options);

        return (
            <div className="radio-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {rawOptions.map((opt, idx) => {
                    const optValue = resolveOptionValue(opt);
                    const optLabel = resolveOptionDisplayLabel(opt, selectedLanguage);
                    return (
                        <label key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input
                                type="radio"
                                name={`field-${field.id}`}
                                value={optValue}
                                checked={formValues[field.id] === optValue}
                                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            />
                            <span>{optLabel}</span>
                        </label>
                    );
                })}
            </div>
        );
    }

    if (field.type === "checkbox") {
        const rawOptions = normalizeOptions(config?.options);

        if (rawOptions.length > 0) {
            return (
                <div className="checkbox-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {rawOptions.map((opt, idx) => {
                        const optValue = resolveOptionValue(opt);
                        const optLabel = resolveOptionDisplayLabel(opt, selectedLanguage);
                        const currentList = Array.isArray(formValues[field.id])
                            ? formValues[field.id]
                            : [];
                        const isChecked = currentList.includes(optValue);

                        return (
                            <label key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input
                                    type="checkbox"
                                    name={`field-${field.id}`}
                                    value={optValue}
                                    checked={isChecked}
                                    onChange={(e) => {
                                        let nextList;
                                        if (e.target.checked) {
                                            nextList = [...currentList, optValue];
                                        } else {
                                            nextList = currentList.filter((v) => v !== optValue);
                                        }
                                        handleFieldChange(field.id, nextList);
                                    }}
                                />
                                <span>{optLabel}</span>
                            </label>
                        );
                    })}
                </div>
            );
        }

        return (
            <div className="checkbox-preview">
                <input
                    id={inputId}
                    type="checkbox"
                    checked={Boolean(formValues?.[field.id])}
                    onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                />
                <span>{resolveFieldLabel(field, selectedLanguage)}</span>
            </div>
        );
    }

    if (field.type === "file") {
        return <input id={inputId} type="file" disabled />;
    }

    if (field.type === "rating") {
        return (
            <div className="rating-preview" aria-label="Rating preview">
                {Array.from({ length: 5 }, (_, index) => (
                    <span key={index} className="star-icon">
                        ☆
                    </span>
                ))}
            </div>
        );
    }

    return (
        <input
            id={inputId}
            type="text"
            placeholder={resolvedPlaceholder}
            value={formValues?.[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
        />
    );
};



const parseMultilingualText = (value) => {
    if (!value) return { en: "", te: "" };
    if (typeof value === "object" && value !== null) {
        return { en: value.en || "", te: value.te || "" };
    }
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (typeof parsed === "object" && parsed !== null) {
                return { en: parsed.en || "", te: parsed.te || "" };
            }
        } catch (e) {
            // Plain string
        }
        return { en: value, te: "" };
    }
    return { en: String(value), te: "" };
};

export default function Builder() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [retentionDays, setRetentionDays] = useState(30);
    const urlFormId = searchParams.get("id");
    const [selectedField, setSelectedField] = useState(null);
    const [titleData, setTitleData] = useState({ en: "", te: "" });
    const [descriptionData, setDescriptionData] = useState({ en: "", te: "" });
    const [fieldTypes, setFieldTypes] = useState([]);
    const [formId, setFormId] = useState(null);
    const [fields, setFields] = useState([]);
    const [rules, setRules] = useState([]);
    const [editingField, setEditingField] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [shareUrl, setShareUrl] = useState("");
    const [isGeneratingShare, setIsGeneratingShare] = useState(false);
    const [fieldStates, setFieldStates] = useState({});
    const [formValues, setFormValues] = useState({});
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const normalizeVersionStatus = (status) =>
        (status ?? "").toString().trim().toLowerCase();

    const isDraftVersion = (version) =>
        normalizeVersionStatus(version?.status) === "draft";

    const isPublished = normalizeVersionStatus(selectedVersion?.status) === "published";
    const isLocked = !selectedVersion || isPublished;

    const fetchVersions = async (id, preferredVersion = null) => {
        try {
            const response = await getFormVersions(id);
            const versionsData = Array.isArray(response.data) ? response.data : [];

            setVersions(versionsData);

            const draftVersion = versionsData.find(isDraftVersion);
            const nextSelectedVersion = preferredVersion || draftVersion || versionsData[0] || null;

            setSelectedVersion(nextSelectedVersion);
            return nextSelectedVersion;
        } catch (error) {
            console.error("Failed to fetch versions:", error);
            setVersions([]);
            setSelectedVersion(null);
            alert("Failed to load version history.");
            return null;
        }
    };
    useEffect(() => {
        if (urlFormId) {
            setFormId(Number(urlFormId));
        }
    }, [urlFormId]);
    useEffect(() => {
        if (!formId) {
            setVersions([]);
            setSelectedVersion(null);
            return;
        }
        console.log("Loading form:", formId);
        fetchForm(formId);
        fetchVersions(formId);
        fetchRules(formId);
        fetchRetentionPolicy(formId);
    }, [formId]);
    useEffect(() => {
        const fetchFieldTypes = async () => {
            try {
                const response = await API.get("/field-types/");
                setFieldTypes(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error(error);
                setFieldTypes([]);
            }
        };

        fetchFieldTypes();
    }, []);
    const fetchRetentionPolicy = async (id = formId) => {
        if (!id) return;

        try {
            const res = await getRetentionPolicyApi(id);
            setRetentionDays(res.data.retention_days);
        } catch (err) {
            console.error(err);
        }
    };
    const saveRetentionPolicy = async () => {
        try {
            await updateRetentionPolicyApi(formId, retentionDays);
            alert("Retention policy updated.");
        } catch (err) {
            console.error(err);
            alert("Failed to update retention policy.");
        }
    };
    const fetchForm = async (id) => {
        try {
            const response = await API.get(`/forms/${id}`);
            console.log("BUILDER RESPONSE:", response.data);
            const formData = response.data || {};

            setTitleData(parseMultilingualText(formData.title));
            setDescriptionData(parseMultilingualText(formData.description));
            setFields(
                Array.isArray(formData.fields)
                    ? [...formData.fields].sort(
                        (a, b) => a.field_order - b.field_order
                    )
                    : []
            );
            console.log("FIELDS AFTER FETCH:", formData.fields);
        } catch (error) {
            console.error(error);
        }
    };
    const fetchRules = async (id = formId) => {
        if (!id) return;

        try {
            const response = await getConditionalRulesApi(id);
            setRules(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch rules:", error);
            setRules([]);
        }
    };
    const createForm = async () => {
        const titleEn = titleData.en.trim();
        const titleTe = titleData.te.trim();

        if (!titleEn && !titleTe) {
            alert("Please enter a form title.");
            return;
        }

        const titlePayload = JSON.stringify({
            en: titleEn || titleTe,
            te: titleTe,
        });

        const descriptionPayload = JSON.stringify({
            en: descriptionData.en || "",
            te: descriptionData.te || "",
        });

        try {
            const response = await API.post("/forms/", {
                title: titlePayload,
                description: descriptionPayload,
            });

            const createdFormId = response.data.id;
            setFormId(createdFormId);
            setSelectedField(null);
            setEditingField(null);
            await fetchForm(createdFormId);
            await fetchRules(createdFormId);
            const draftResponse = await createNewDraftApi(createdFormId);
            const createdDraft = draftResponse?.data || null;
            await fetchVersions(createdFormId, createdDraft);
            alert("Form created successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to create form.");
        }
    };

    const publishCurrentForm = async () => {
        if (!formId) {
            alert("Please create a form first!");
            return;
        }

        const confirmPublish = window.confirm(
            "Are you sure you want to publish this draft?"
        );

        if (!confirmPublish) return;

        try {
            await publishFormApi(formId);
            alert("Form published successfully!");
            await fetchForm(formId);
            await fetchVersions(formId);
            setSelectedField(null);
            setEditingField(null);
        } catch (error) {
            console.error(error);
            alert("Failed to publish form.");
        }
    };

    const archiveCurrentForm = async () => {
        if (!formId) {
            alert("Please create a form first!");
            return;
        }

        const confirmArchive = window.confirm(
            "Archive this published version?"
        );

        if (!confirmArchive) return;

        try {
            await archiveFormApi(formId);
            alert("Form archived successfully!");
            await fetchForm(formId);
            await fetchVersions(formId);
        } catch (error) {
            console.error(error);
            alert("Failed to archive form.");
        }
    };

    const generateShareLink = async () => {
        if (!formId) {
            alert("Please create a form first!");
            return;
        }

        try {
            setIsGeneratingShare(true);
            const res = await generateShareableLinkApi(formId);
            const url = res.data?.url || "";
            setShareUrl(url);
            alert("Shareable link generated!");
        } catch (err) {
            console.error(err);
            alert("Failed to generate shareable link.");
        } finally {
            setIsGeneratingShare(false);
        }
    };

    const copyShareLink = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard!");
        } catch (err) {
            console.error(err);
            alert("Failed to copy link. Please copy manually.");
        }
    };

    const handleVersionSelect = async (version) => {
        setSelectedVersion(version);
        setEditingField(null);
        setSelectedField(null);

        try {
            const res = await API.get(`/forms/${formId}/versions/${version.id}`);
            const snapshot = res.data || {};

            setTitleData(parseMultilingualText(snapshot.title));
            setDescriptionData(parseMultilingualText(snapshot.description));
            setFields(Array.isArray(snapshot.fields) ? snapshot.fields : []);
            await fetchRules(formId);
        } catch (error) {
            console.error("Failed to load selected version:", error);
            alert("Failed to load the selected version.");
        }
    };

    const handleEditAsNewDraft = async () => {
        if (!selectedVersion || !isPublished) return;

        try {
            const createdDraftResponse = await createNewDraftApi(formId);
            const createdDraft = createdDraftResponse?.data || null;
            const response = await getDraftApi(formId);
            const draft = response?.data || createdDraft;

            setSelectedVersion(draft);
            await fetchForm(formId);
            await fetchVersions(formId, draft);

            setEditingField(null);
            setSelectedField(null);

            alert("Draft created successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to create draft.");
        }
    };

    const formatDate = (value) => {
        if (!value) return "—";

        return new Date(value).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };    const addField = async (fieldOrType, maybeLabel, maybeConfig) => {
        if (!formId) {
            alert("Please create a form first!");
            return;
        }

        if (isLocked) {
            alert("A draft version must be selected to add fields.");
            return;
        }

        let rawType = "";
        let rawLabel = null;
        let rawConfig = {};

        if (typeof fieldOrType === "object" && fieldOrType !== null) {
            if (maybeLabel !== undefined) {
                rawType = fieldOrType.type;
                rawLabel = maybeLabel;
                rawConfig = maybeConfig || {};
            } else {
                rawType = fieldOrType.type;
                rawLabel = fieldOrType.label;
                rawConfig = fieldOrType.config || {};
            }
        } else if (typeof fieldOrType === "string") {
            rawType = fieldOrType;
            rawLabel = maybeLabel;
            rawConfig = maybeConfig || {};
        }

        if (!rawType || !rawLabel) {
            alert("Field data is invalid. Please select a field type and enter a label.");
            return;
        }

        const labelObj = typeof rawLabel === "object" && rawLabel !== null
            ? { en: "", ...rawLabel }
            : { en: String(rawLabel ?? "") };

        const formattedConfig = {};
        if (rawConfig && typeof rawConfig === "object" && !Array.isArray(rawConfig)) {
            for (const [key, val] of Object.entries(rawConfig)) {
                if (key === "placeholder" || key === "help_text" || key === "validation_message") {
                    formattedConfig[key] = typeof val === "object" && val !== null
                        ? { en: "", ...val }
                        : { en: String(val ?? "") };
                } else if (key === "options" && Array.isArray(val)) {
                    formattedConfig[key] = val.map((opt) => {
                        if (typeof opt === "string") {
                            return { value: opt, label: { en: opt } };
                        }
                        if (typeof opt === "object" && opt !== null) {
                            const optVal = opt.value || opt.label?.en || opt.en || "";
                            let optLabelObj = {};
                            if (opt.label && typeof opt.label === "object") {
                                optLabelObj = { en: "", ...opt.label };
                            } else if (typeof opt.label === "string") {
                                optLabelObj = { en: opt.label };
                            } else {
                                optLabelObj = { en: optVal };
                            }
                            return { value: optVal, label: optLabelObj };
                        }
                        return { value: String(opt), label: { en: String(opt) } };
                    });
                } else {
                    formattedConfig[key] = val;
                }
            }
        }

        const payload = {
            field_order: fields.length + 1,
            type: rawType,
            label: labelObj,
            config: formattedConfig,
        };

        try {
            console.log("POST /forms/" + formId + "/fields payload:", payload);
            const response = await API.post(`/forms/${formId}/fields`, payload);
            console.log("Field added response:", response.data);

            await fetchForm(formId);
            await fetchVersions(formId);
            await fetchRules(formId);
            setSelectedField(null);
            setEditingField(null);
            alert("Field added successfully!");
        } catch (error) {
            console.error("Full Error:", error);
            let message = "Failed to add field.";
            if (error.response?.data?.detail) {
                if (typeof error.response.data.detail === "string") {
                    message = `Failed to add field: ${error.response.data.detail}`;
                } else {
                    message = `Failed to add field: ${JSON.stringify(error.response.data.detail)}`;
                }
            }
            alert(message);
        }
    };

    const deleteField = async (fieldId) => {
        if (!formId) {
            alert("Please create a form first!");
            return;
        }

        if (isLocked) {
            alert("A draft version must be selected to delete fields.");
            return;
        }

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this field?"
        );

        if (!confirmDelete) return;

        try {
            await API.delete(`/forms/${formId}/fields/${fieldId}`);
            await fetchForm(formId);
            await fetchVersions(formId);
            await fetchRules(formId);
            alert("Field deleted successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to delete field.");
        }
    };

    const updateField = async (updatedField, maybeLabel, maybeConfig) => {
        if (isLocked) {
            alert("A draft version must be selected to update fields.");
            return;
        }

        let fieldId = null;
        let rawLabel = null;
        let rawConfig = {};

        if (typeof updatedField === "object" && updatedField !== null) {
            if (maybeLabel !== undefined) {
                fieldId = updatedField.id || updatedField;
                rawLabel = maybeLabel;
                rawConfig = maybeConfig || {};
            } else {
                fieldId = updatedField.id;
                rawLabel = updatedField.label;
                rawConfig = updatedField.config || {};
            }
        } else {
            fieldId = updatedField;
            rawLabel = maybeLabel;
            rawConfig = maybeConfig || {};
        }

        const labelObj = typeof rawLabel === "object" && rawLabel !== null
            ? { en: "", ...rawLabel }
            : { en: String(rawLabel ?? "") };

        const formattedConfig = {};
        if (rawConfig && typeof rawConfig === "object" && !Array.isArray(rawConfig)) {
            for (const [key, val] of Object.entries(rawConfig)) {
                if (key === "placeholder" || key === "help_text" || key === "validation_message") {
                    formattedConfig[key] = typeof val === "object" && val !== null
                        ? { en: "", ...val }
                        : { en: String(val ?? "") };
                } else if (key === "options" && Array.isArray(val)) {
                    formattedConfig[key] = val.map((opt) => {
                        if (typeof opt === "string") {
                            return { value: opt, label: { en: opt } };
                        }
                        if (typeof opt === "object" && opt !== null) {
                            const optVal = opt.value || opt.label?.en || opt.en || "";
                            let optLabelObj = {};
                            if (opt.label && typeof opt.label === "object") {
                                optLabelObj = { en: "", ...opt.label };
                            } else if (typeof opt.label === "string") {
                                optLabelObj = { en: opt.label };
                            } else {
                                optLabelObj = { en: optVal };
                            }
                            return { value: optVal, label: optLabelObj };
                        }
                        return { value: String(opt), label: { en: String(opt) } };
                    });
                } else {
                    formattedConfig[key] = val;
                }
            }
        }

        try {
            await API.patch(`/forms/${formId}/fields/${fieldId}`, {
                label: labelObj,
                config: formattedConfig,
            });

            await fetchForm(formId);
            await fetchRules(formId);
            await fetchVersions(formId);
            setEditingField(null);
            setSelectedField(null);
            alert("Field updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update field.");
        }
    };

    const handleDragEnd = async (event) => {
        if (isLocked) return;

        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = fields.findIndex(
            (field) => field.id === active.id
        );

        const newIndex = fields.findIndex(
            (field) => field.id === over.id
        );

        const newFields = arrayMove(fields, oldIndex, newIndex);

        setFields(newFields);

        try {
            await API.patch(`/forms/${formId}/fields/reorder`, {
                field_ids: newFields.map((field) => field.id),
            });

            await fetchForm(formId);
            await fetchVersions(formId);
            await fetchRules(formId);
        } catch (error) {
            console.error(error);
            alert("Failed to reorder fields.");
        }
    };

    const handleFieldTypeSelect = (fieldType) => {
        setSelectedField(fieldType);
        setEditingField(null);
    };

    const sortedFields = [...fields].sort(
        (a, b) => (a.field_order ?? 0) - (b.field_order ?? 0)
    );
    const evaluateRules = async (values) => {
        try {
            const res = await evaluateRulesApi(formId, values);
            setFieldStates(res.data);
        } catch (err) {
            console.error(err);
        }
    };
    const handleFieldChange = async (fieldId, value) => {
        const updatedValues = {
            ...formValues,
            [fieldId]: value,
        };

        setFormValues(updatedValues);

        await evaluateRules(updatedValues);
    };
    return (
        <DashboardLayout>

            <TopBar
                title="Form Builder"
                subtitle="Create and manage dynamic forms"
                showButton={false}
            />

            <main className="dashboard-content">
                <section className="form-header">
                    <div className="header-top">
                        <div>
                            <p className="eyebrow">Low-Code Builder</p>
                            <h1>{t("Create New Form")}</h1>
                            <p className="header-copy">{t("Design forms, manage versions, and publish with confidence.")}</p>
                        </div>
                        <div className="header-actions">
                            <button className="primary-btn" onClick={() => setPreviewMode(!previewMode)}>
                                {previewMode ? t("Back to Builder") : t("Preview Form")}
                            </button>
                            <button className="primary-btn" onClick={publishCurrentForm} disabled={!formId}>
                                {t("Publish")}
                            </button>
                            <button className="primary-btn" onClick={archiveCurrentForm} disabled={!formId}>
                                {t("Archive")}
                            </button>
                            <button className="primary-btn" onClick={generateShareLink} disabled={!formId || isGeneratingShare}>
                                {isGeneratingShare ? t("Generating...") : (shareUrl ? t("Shareable Link") : t("Get Shareable Link"))}
                            </button>
                            <button className="primary-btn" onClick={createForm} disabled={formId !== null}>
                                {formId ? t("Form Created") : t("Create Form")}
                            </button>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>{t("Form Title")}</label>
                            <input
                                type="text"
                                value={titleData.en || ""}
                                onChange={(e) =>
                                    setTitleData((prev) => ({ ...prev, en: e.target.value }))
                                }
                                placeholder={t("Enter form title")}
                            />
                        </div>

                        <div className="form-group">
                            <label>{t("Description")}</label>
                            <textarea
                                value={descriptionData.en || ""}
                                onChange={(e) =>
                                    setDescriptionData((prev) => ({ ...prev, en: e.target.value }))
                                }
                                placeholder={t("Enter description")}
                            />
                        </div>
                    </div>

                    {formId && (
                        <p className="form-status">Form created successfully!</p>
                    )}
                </section>

                {formId && (
                    <section className="version-history">
                        <div className="version-history-header">
                            <div>
                                <p className="eyebrow">VERSION HISTORY</p>
                                <h2>Versions</h2>
                            </div>
                            {isPublished && (
                                <button className="ghost-btn version-action" onClick={handleEditAsNewDraft}>
                                    Edit as New Draft
                                </button>
                            )}
                        </div>

                        <div className="version-summary">
                            <div className="version-summary-card">
                                <span className="summary-label">Selected Version</span>
                                <strong className="summary-val">{selectedVersion ? selectedVersion.version : "—"}</strong>
                            </div>
                            <div className="version-summary-card">
                                <span className="summary-label">Status</span>
                                <div>
                                    <span
                                        className={`version-status ${normalizeVersionStatus(selectedVersion?.status) || "draft"}`}
                                    >
                                        {selectedVersion?.status ? selectedVersion.status.toUpperCase() : "DRAFT"}
                                    </span>
                                </div>
                            </div>
                            <div className="version-summary-card">
                                <span className="summary-label">Published</span>
                                <strong className="summary-val">{formatDate(selectedVersion?.published_at)}</strong>
                            </div>
                            <div className="version-summary-card">
                                <span className="summary-label">Created</span>
                                <strong className="summary-val">{formatDate(selectedVersion?.created_at)}</strong>
                            </div>
                        </div>

                        <div className="version-list">
                            {versions.length === 0 ? (
                                <div className="empty-state">No versions available.</div>
                            ) : (
                                versions.map((version) => {
                                    const statusClass = normalizeVersionStatus(version?.status) || "draft";
                                    const isSelected = selectedVersion?.id === version.id;

                                    return (
                                        <button
                                            key={version.id}
                                            type="button"
                                            className={`version-card ${isSelected ? "selected" : ""}`}
                                            onClick={() => handleVersionSelect(version)}
                                        >
                                            <div className="version-card-content">
                                                <div className="version-card-left">
                                                    <h3 className="version-card-title">Version {version.version}</h3>
                                                    <p className="version-card-meta">
                                                        Published: {formatDate(version.published_at)}
                                                    </p>
                                                </div>
                                                <div className="version-card-right">
                                                    <span className={`version-status ${statusClass}`}>
                                                        {version.status ? version.status.toUpperCase() : "DRAFT"}
                                                    </span>
                                                    <div className="version-card-created">
                                                        <span className="created-label">Created:</span>
                                                        <span className="created-value">{formatDate(version.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </section>
                )}
                <section className="retention-card">
                    <div className="retention-header">
                        <div>
                            <p className="eyebrow">{t("Retention Policy")}</p>
                            <h2>{t("Retention Policy")}</h2>
                            <p className="retention-description">
                                {t("Automatically archive responses after a specified number of days.")}
                            </p>
                        </div>
                    </div>

                    <div className="retention-body retention-controls">
                        <label>{t("Automatically archive responses after")}</label>

                        <input
                            className="retention-input"
                            type="number"
                            min="0"
                            value={retentionDays}
                            onChange={(e) =>
                                setRetentionDays(Number(e.target.value))
                            }
                        />

                        <span>{t("days")}</span>

                        <button className="retention-save-btn" onClick={saveRetentionPolicy}>
                            {t("Save Policy")}
                        </button>
                    </div>
                </section>
                {shareUrl && (
                    <section className="share-link-card">
                        <div className="share-link-header">
                            <div>
                                <p className="eyebrow">Shareable Link</p>
                                <h2>Anyone with this link can fill out the form.</h2>
                            </div>
                        </div>

                        <div className="share-link-body">
                            <input type="text" readOnly value={shareUrl} className="share-link-input" />
                            <div className="share-link-actions">
                                <button type="button" className="share-link-copy" onClick={copyShareLink}>
                                    Copy Link
                                </button>
                                <button type="button" className="share-link-open" onClick={() => window.open(shareUrl, "_blank")}>
                                    Open Form
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                <div className={`app ${previewMode ? "preview-mode" : ""}`}>
                    {!previewMode && (
                        <div className="builder-left-column">
                            <div className="palette">
                                <FieldPalette onSelect={handleFieldTypeSelect} />
                            </div>
                        </div>
                    )}

                    {!previewMode && (
                        <div className="builder-center-column">
                            <div className="config">
                                <ConfigPanel
                                    selectedField={selectedField}
                                    editingField={editingField}
                                    setEditingField={setEditingField}
                                    fieldTypes={fieldTypes}
                                    onAddField={addField}
                                    onUpdateField={updateField}
                                    isLocked={isLocked}
                                    selectedLanguage={selectedLanguage}
                                />
                                {formId && (
                                    <ConditionalRuleBuilder
                                        formId={formId}
                                        fields={fields}
                                        rules={rules}
                                        fetchRules={fetchRules}
                                        selectedLanguage={selectedLanguage}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                    <div className={`builder-canvas-column ${previewMode ? "preview-canvas" : ""}`}>
                        <div className="builder-canvas-header">
                            <div>
                                <p className="eyebrow">{previewMode ? "Live Preview" : "Form Canvas"}</p>
                                <h2>{previewMode ? "Preview Form" : "Form Canvas"}</h2>
                                <p className="builder-canvas-subtitle">
                                    {previewMode
                                        ? "This is how your form will look to respondents."
                                        : "Your form fields will appear here"}
                                </p>
                            </div>
                        </div>

                        <div className="builder-canvas-body">
                            {previewMode ? (
                                <div className="preview-form">
                                    <div className="preview-header">
                                        <h2>{resolveText(titleData, selectedLanguage) || "Untitled Form"}</h2>
                                        <p>
                                            {resolveText(descriptionData, selectedLanguage) || "This is how your form will look to respondents."}
                                        </p>
                                    </div>

                                    {sortedFields.length === 0 ? (
                                        <div className="preview-empty">No fields added yet.</div>
                                    ) : (
                                        sortedFields
                                            .filter((field) => {
                                                const state = fieldStates[field.id];

                                                if (!state) return true;

                                                return state.visible;
                                            })
                                            .map((field) => {
                                                const config = {
                                                    ...(field.config || {}),
                                                    required:
                                                        fieldStates[field.id]?.required ||
                                                        Boolean(field.config?.required),
                                                };

                                                return (
                                                    <div className="preview-field" key={field.id}>
                                                        <label htmlFor={`field-${field.id}`}>
                                                            {resolveFieldLabel(field, selectedLanguage)}
                                                            {config.required && (
                                                                <span className="required-mark">*</span>
                                                            )}
                                                        </label>

                                                        {renderPreviewInput(
                                                            field,
                                                            config,
                                                            formValues,
                                                            fieldStates,
                                                            handleFieldChange,
                                                            selectedLanguage
                                                        )}
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            ) : fields.length === 0 ? (
                                <div className="canvas-empty-state">
                                    <div className="canvas-empty-icon">📄</div>
                                    <h3>No fields added yet.</h3>
                                    <p>Select a field from the left and click Add Field.</p>
                                </div>
                            ) : (
                                <DndContext
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={fields.map((field) => field.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {fields
                                            .filter((field) => {
                                                const state = fieldStates[field.id];

                                                if (!state) return true;

                                                return state.visible;
                                            })
                                            .map((field, index) => (
                                                <SortableField
                                                    key={field.id}
                                                    field={field}
                                                    rules={rules}
                                                    index={index}
                                                    fieldTypes={fieldTypes}
                                                    isLocked={isLocked}
                                                    onEdit={(field) => {
                                                        const definition = fieldTypes.find(
                                                            (f) => f.type === field.type
                                                        );

                                                        setEditingField({
                                                            ...field,
                                                            definition,
                                                        });
                                                    }}
                                                    onDelete={deleteField}
                                                    selectedLanguage={selectedLanguage}
                                                />
                                            ))}
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                    </div>

                    {!previewMode && (
                        <div className="builder-rule-column">
                            <div className="builder-rule-header">
                                <p className="eyebrow">Rule Flow</p>
                                <h2>Rule Flow</h2>
                                <p className="builder-canvas-subtitle">
                                    Visualize conditional logic.
                                </p>
                            </div>

                            <div className="rule-flow-container">
                                {rules.length === 0 ? (
                                    <div className="empty-state">No conditional rules.</div>
                                ) : (
                                    rules.map((rule) => {
                                        const trigger = fields.find((f) => f.id === rule.trigger_field_id);
                                        const target = fields.find((f) => f.id === rule.target_field_id);

                                        return (
                                            <div className="rule-card" key={rule.id}>
                                                <div className="rule-node">{resolveFieldLabel(trigger, selectedLanguage)}</div>
                                                <div className="rule-arrow">↓</div>
                                                <div className="rule-condition">IF {rule.operator} {rule.value}</div>
                                                <div className="rule-arrow">↓</div>
                                                <div className="rule-action">{rule.action.toUpperCase()}</div>
                                                <div className="rule-arrow">↓</div>
                                                <div className="rule-node">{resolveFieldLabel(target, selectedLanguage)}</div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

        </DashboardLayout>
    );
}
