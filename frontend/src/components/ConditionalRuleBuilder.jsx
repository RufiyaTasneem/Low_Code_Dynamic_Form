import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    createConditionalRuleApi,
    deleteConditionalRuleApi,
} from "../api/formApi";
import "./ConditionalRuleBuilder.css";

const resolveFieldLabel = (field, language = "en") => {
    if (typeof field?.label === "string") {
        return field.label;
    }

    return field?.label?.[language] || field?.label?.en || "";
};

function ConditionalRuleBuilder({
    formId,
    fields,
    rules,
    fetchRules,
    selectedLanguage = "en",
}) {
    const { t } = useTranslation();
    const [triggerFieldId, setTriggerFieldId] = useState("");
    const [operator, setOperator] = useState("equals");
    const [value, setValue] = useState("");
    const [targetFieldId, setTargetFieldId] = useState("");
    const [action, setAction] = useState("show");

    const addRule = async () => {
        if (!triggerFieldId || !targetFieldId || !value) {
            alert("Please complete all fields.");
            return;
        }

        try {
            await createConditionalRuleApi(formId, {
                trigger_field_id: Number(triggerFieldId),
                operator,
                value,
                target_field_id: Number(targetFieldId),
                action,
            });

            await fetchRules();

            setTriggerFieldId("");
            setTargetFieldId("");
            setValue("");
            setOperator("equals");
            setAction("show");

            alert("Rule added successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to add rule.");
        }
    };

    const deleteRule = async (id) => {
        if (!window.confirm("Delete this rule?")) return;

        try {
            await deleteConditionalRuleApi(formId, id);
            await fetchRules();
        } catch (err) {
            console.error(err);
            alert("Failed to delete.");
        }
    };

    return (
        <div className="config-card">
            <h3>⚡ {t("Conditional Logic")}</h3>

            <label>{t("Trigger Field")}</label>
            <select
                value={triggerFieldId}
                onChange={(e) => setTriggerFieldId(e.target.value)}
            >
                <option value="">Select Field</option>
                {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                        {resolveFieldLabel(field, selectedLanguage)}
                    </option>
                ))}
            </select>

            <label>{t("Operator")}</label>
            <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
            >
                <option value="equals">{t("Equals")}</option>
                <option value="not_equals">{t("Not Equals")}</option>
                <option value="contains">{t("Contains")}</option>
            </select>

            <label>{t("Value")}</label>
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Comparison Value"
            />

            <label>{t("Action")}</label>
            <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
            >
                <option value="show">{t("Show")}</option>
                <option value="hide">{t("Hide")}</option>
                <option value="require">{t("Require")}</option>
            </select>

            <label>{t("Target Field")}</label>
            <select
                value={targetFieldId}
                onChange={(e) => setTargetFieldId(e.target.value)}
            >
                <option value="">Select Field</option>
                {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                        {resolveFieldLabel(field, selectedLanguage)}
                    </option>
                ))}
            </select>

            <button className="primary-btn" onClick={addRule}>
                {t("Add Rule")}
            </button>

            <hr />

            <h4>Existing Rules</h4>

            {rules.length === 0 ? (
                <p>No rules yet.</p>
            ) : (
                rules.map((rule) => {
                    const trigger = fields.find((f) => f.id === rule.trigger_field_id);
                    const target = fields.find((f) => f.id === rule.target_field_id);

                    return (
                        <div className="rule-card" key={rule.id}>
                            <strong>
                                IF {resolveFieldLabel(trigger, selectedLanguage)}
                            </strong>
                            <div>
                                {rule.operator} "{rule.value}"
                            </div>
                            <div>
                                THEN {rule.action.toUpperCase()}{" "}
                                {resolveFieldLabel(target, selectedLanguage)}
                            </div>
                            <button onClick={() => deleteRule(rule.id)}>
                                {t("Delete")}
                            </button>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default ConditionalRuleBuilder;