import { useState } from "react";

function ConfigPanel({ selectedField, onAddField }) {
    const [config, setConfig] = useState({});

    if (!selectedField) {
        return (
            <div className="no-selection">
                <h2>Select a field from the left panel</h2>
            </div>
        );
    }

    const handleChange = (name, value) => {
        setConfig((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAdd = () => {
        const fieldData = {
            label: selectedField.label,
            type: selectedField.type,
            field_order: 1,
            config: config,
        };

        console.log("Sending:", fieldData);

        onAddField(fieldData);

        setConfig({});
    };

    return (
        <div>
            <h2>{selectedField.label} Configuration</h2>

            {selectedField.config.map((item) => (
                <div className="form-group" key={item.name}>
                    <label>{item.label}</label>

                    <input
                        type={
                            item.type === "number"
                                ? "number"
                                : item.type === "date"
                                    ? "date"
                                    : "text"
                        }
                        placeholder={item.label}
                        value={config[item.name] || ""}
                        onChange={(e) =>
                            handleChange(item.name, e.target.value)
                        }
                    />
                </div>
            ))}

            <button onClick={handleAdd}>
                Add Field
            </button>
        </div>
    );
}

export default ConfigPanel;