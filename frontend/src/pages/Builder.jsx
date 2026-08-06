import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

const resolveFieldLabel = (field, language = "en") => {
    if (typeof field?.label === "string") {
        return field.label;
    }

    return field?.label?.[language] || field?.label?.en || "";
};

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

    if (field.type === "text") {
        return (
            <input
                id={inputId}
                type="text"
                placeholder={config?.placeholder || resolveFieldLabel(field, selectedLanguage)}
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
                placeholder={config?.placeholder || resolveFieldLabel(field, selectedLanguage)}
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
                placeholder={resolveFieldLabel(field, selectedLanguage)}
                value={formValues[field.id] || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
        );
    }

    if (field.type === "dropdown") {
        const options = Array.isArray(config?.options)
            ? config.options
            : String(config?.options || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

        return (
            <select
                id={inputId}
                value={formValues[field.id] || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
                <option value="">Select...</option>

                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        );
    }

    if (field.type === "checkbox") {
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
            placeholder={resolveFieldLabel(field, selectedLanguage)}
            value={formValues?.[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
        />
    );
};

export default function Builder() {
    const [searchParams] = useSearchParams();
    const [retentionDays, setRetentionDays] = useState(30);
    const urlFormId = searchParams.get("id");
    const [selectedField, setSelectedField] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
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

            setTitle(formData.title || "");
            setDescription(formData.description || "");
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
        if (!title.trim()) {
            alert("Please enter a form title.");
            return;
        }

        try {
            const response = await API.post("/forms/", {
                title,
                description,
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

            setTitle(snapshot.title || "");
            setDescription(snapshot.description || "");
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
    };

    const addField = async (fieldData) => {
        console.log("addField start", { formId, selectedVersion, isLocked, fieldData });

        if (!formId) {
            alert("Please create a form first!");
            return;
        }

        if (isLocked) {
            alert("A draft version must be selected to add fields.");
            return;
        }

        if (!fieldData || !fieldData.type || !fieldData.label) {
            console.error("Invalid fieldData", fieldData);
            alert("Field data is invalid. Please select a field type and enter a label.");
            return;
        }

        try {
            console.log("POST /forms/" + formId + "/fields", fieldData);
            const response = await API.post(`/forms/${formId}/fields`, fieldData);
            console.log("Field added response", response.data);

            await fetchForm(formId);
            await fetchVersions(formId);
            await fetchRules(formId);
            alert("Field added successfully!");
        } catch (error) {
            console.error("Full Error:", error);

            let message = "Failed to add field.";

            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Response:", error.response.data);
                if (error.response.data?.detail) {
                    message = `Failed to add field: ${error.response.data.detail}`;
                } else {
                    message = `Failed to add field: ${JSON.stringify(error.response.data)}`;
                }
            } else if (error.request) {
                console.log("Request:", error.request);
            } else {
                console.log("Message:", error.message);
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

    const updateField = async (updatedField) => {
        if (isLocked) {
            alert("A draft version must be selected to update fields.");
            return;
        }

        try {
            await API.patch(`/forms/${formId}/fields/${updatedField.id}`, {
                label: updatedField.label,
                config: updatedField.config,
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
                            <h1>Create New Form</h1>
                            <p className="header-copy">Design forms, manage versions, and publish with confidence.</p>
                        </div>
                        <div className="header-actions">
                            <label className="form-group" style={{ margin: 0, minWidth: 170 }}>
                                <span style={{ display: "block", fontSize: "0.8rem", marginBottom: 4 }}>Label Language</span>
                                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                                    <option value="en">English (en)</option>
                                    <option value="te">Telugu (te)</option>
                                </select>
                            </label>
                            <button className="ghost-btn" onClick={() => setPreviewMode(!previewMode)}>
                                {previewMode ? "Back to Builder" : "Preview Form"}
                            </button>
                            <button className="primary-btn" onClick={publishCurrentForm} disabled={!formId}>
                                Publish
                            </button>
                            <button className="secondary-btn" onClick={archiveCurrentForm} disabled={!formId}>
                                Archive
                            </button>
                            <button className="ghost-btn" onClick={generateShareLink} disabled={!formId || isGeneratingShare}>
                                {isGeneratingShare ? "Generating..." : "Share"}
                            </button>
                            <button className="primary-btn" onClick={createForm} disabled={formId !== null}>
                                {formId ? "Form Created" : "Create Form"}
                            </button>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Form Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter form title"
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Registration form for students"
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
                                <p className="eyebrow">Version History</p>
                                <h2>Versions</h2>
                            </div>
                            {isPublished && (
                                <button className="ghost-btn" onClick={handleEditAsNewDraft}>
                                    Edit as New Draft
                                </button>
                            )}
                        </div>

                        <div className="version-summary">
                            <div className="version-summary-item">
                                <span>Selected Version</span>
                                <strong>{selectedVersion ? selectedVersion.version : "None"}</strong>
                            </div>
                            <div className="version-summary-item">
                                <span>Status</span>
                                <span
                                    className={`version-badge ${normalizeVersionStatus(selectedVersion?.status) || "draft"}`}
                                >
                                    {selectedVersion?.status || "Draft"}
                                </span>
                            </div>
                            <div className="version-summary-item">
                                <span>Published</span>
                                <strong>{formatDate(selectedVersion?.published_at)}</strong>
                            </div>
                            <div className="version-summary-item">
                                <span>Created</span>
                                <strong>{formatDate(selectedVersion?.created_at)}</strong>
                            </div>
                        </div>

                        <div className="version-list">
                            {versions.length === 0 ? (
                                <div className="empty-state">No versions yet.</div>
                            ) : (
                                versions.map((version) => (
                                    <button
                                        key={version.id}
                                        type="button"
                                        className={`version-card ${selectedVersion?.id === version.id ? "active" : ""
                                            }`}
                                        onClick={() => handleVersionSelect(version)}
                                    >
                                        <div className="version-card-top">
                                            <strong>Version {version.version}</strong>
                                            <span
                                                className={`version-badge ${normalizeVersionStatus(version?.status) || "draft"}`}
                                            >
                                                {version.status}
                                            </span>
                                        </div>
                                        <div className="version-card-details">
                                            <div>
                                                <span className="detail-label">Published</span>
                                                <strong>{formatDate(version.published_at)}</strong>
                                            </div>

                                            <div>
                                                <span className="detail-label">Created</span>
                                                <strong>{formatDate(version.created_at)}</strong>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>
                )}
                <section className="retention-card">
                    <div className="retention-header">
                        <div>
                            <p className="eyebrow">Data Retention</p>
                            <h2>Retention Policy</h2>
                        </div>
                    </div>

                    <div className="retention-body">
                        <label>Automatically archive responses after</label>

                        <input
                            type="number"
                            min="0"
                            value={retentionDays}
                            onChange={(e) =>
                                setRetentionDays(Number(e.target.value))
                            }
                        />

                        <span>days</span>

                        <button onClick={saveRetentionPolicy}>
                            Save Policy
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
                                <button type="button" className="ghost-btn" onClick={copyShareLink}>
                                    Copy Link
                                </button>
                                <button type="button" onClick={() => window.open(shareUrl, "_blank")}>
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
                                        <h2>{title || "Untitled Form"}</h2>
                                        <p>
                                            {description || "This is how your form will look to respondents."}
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
