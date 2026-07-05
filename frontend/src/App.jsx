import { useState } from "react";
import "./App.css";
import API from "./api/formApi";

import FieldPalette from "./components/FieldPalette";
import ConfigPanel from "./components/ConfigPanel";

function App() {
  const [selectedField, setSelectedField] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [formId, setFormId] = useState(null);
  const [fields, setFields] = useState([]);

  // Create Form
  const createForm = async () => {
    try {
      const response = await API.post("/forms/", {
        title,
        description,
      });

      setFormId(response.data.id);

      alert("Form created successfully!");

      console.log("Created Form:", response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to create form.");
    }
  };

  // Add Field
  const addField = async (fieldData) => {
    if (!formId) {
      alert("Please create a form first!");
      return;
    }

    try {
      const response = await API.post(
        `/forms/${formId}/fields`,
        fieldData
      );

      console.log("Field Saved:", response.data);

      setFields((prev) => [...prev, response.data]);

      alert("Field added successfully!");
    } catch (error) {
      console.error("Full Error:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Response:", error.response.data);
      } else if (error.request) {
        console.log("Request:", error.request);
      } else {
        console.log("Message:", error.message);
      }

      alert("Failed to add field.");
    }
  };

  return (
    <>
      <div className="form-header">
        <h1>Create New Form</h1>

        <div className="form-group">
          <label>Form Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Student Registration"
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

        <button
          onClick={createForm}
          disabled={formId !== null}
        >
          {formId ? "Form Created" : "Create Form"}
        </button>

        {formId && (
          <p
            style={{
              color: "green",
              marginTop: "15px",
              fontWeight: "bold",
            }}
          >
            Form ID: {formId} created successfully!
          </p>
        )}
      </div>

      <div className="app">
        {/* Left Panel */}
        <div className="palette">
          <FieldPalette onSelect={setSelectedField} />
        </div>

        {/* Right Panel */}
        <div className="config">
          <ConfigPanel
            selectedField={selectedField}
            onAddField={addField}
          />

          <hr />

          <h2>Form Canvas</h2>

          {fields.length === 0 ? (
            <p>No fields added yet.</p>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "15px",
                  marginBottom: "15px",
                  backgroundColor: "#fff",
                }}
              >
                <h3>Field #{index + 1}</h3>

                <div className="form-group">
                  <label>Label</label>
                  <input
                    type="text"
                    value={field.label}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <input
                    type="text"
                    value={field.type}
                    readOnly
                  />
                </div>

                {Object.entries(field.config).length > 0 ? (
                  Object.entries(field.config).map(([key, value]) => (
                    <div
                      className="form-group"
                      key={key}
                    >
                      <label>{key}</label>

                      <input
                        type="text"
                        value={String(value)}
                        readOnly
                      />
                    </div>
                  ))
                ) : (
                  <p>No configuration</p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px",
                  }}
                >
                  <button>Edit</button>
                  <button>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default App;