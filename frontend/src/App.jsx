
import { useState, useEffect } from "react";
import "./App.css";
import API from "./api/formApi";

import FieldPalette from "./components/FieldPalette";
import ConfigPanel from "./components/ConfigPanel";

function App() {
  const [selectedField, setSelectedField] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fieldTypes, setFieldTypes] = useState([]);
  const [formId, setFormId] = useState(null);
  const [fields, setFields] = useState([]);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    const fetchFieldTypes = async () => {
      try {
        const response = await API.get("/field-types/");
        setFieldTypes(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFieldTypes();
  }, []);

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

      setFormId(response.data.id);
      await fetchForm(response.data.id);
      alert("Form created successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to create form.");
    }
  };

  const fetchForm = async (id) => {
    try {
      const response = await API.get(`/forms/${id}`);
      setFields(response.data.fields || []);
    } catch (error) {
      console.error(error);
    }
  };

  const addField = async (fieldData) => {
    if (!formId) {
      alert("Please create a form first!");
      return;
    }

    try {
      await API.post(`/forms/${formId}/fields`, fieldData);
      await fetchForm(formId);
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

  const deleteField = async (fieldId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this field?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/forms/${formId}/fields/${fieldId}`);
      await fetchForm(formId);
      alert("Field deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to delete field.");
    }
  };

  const updateField = async (updatedField) => {
    try {
      await API.patch(`/forms/${formId}/fields/${updatedField.id}`, {
        label: updatedField.label,
        config: updatedField.config,
      });

      await fetchForm(formId);
      setEditingField(null);
      setSelectedField(null);
      alert("Field updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update field.");
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

        <button onClick={createForm} disabled={formId !== null}>
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
        <div className="palette">
          <FieldPalette onSelect={setSelectedField} />
        </div>

        <div className="config">
          <ConfigPanel
            selectedField={selectedField}
            editingField={editingField}
            setEditingField={setEditingField}
            fieldTypes={fieldTypes}
            onAddField={addField}
            onUpdateField={updateField}
          />

          <hr />

          <h2>Form Canvas</h2>

          {fields.length === 0 ? (
            <p>No fields added yet.</p>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="canvas-field">
                <h3>Field #{index + 1}</h3>

                <div className="form-group">
                  <label>Label</label>
                  <input type="text" value={field.label} readOnly />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <input type="text" value={field.type} readOnly />
                </div>

                {Object.entries(field.config || {}).length > 0 ? (
                  Object.entries(field.config).map(([key, value]) => (
                    <div className="form-group" key={key}>
                      <label>{key}</label>
                      <input type="text" value={String(value)} readOnly />
                    </div>
                  ))
                ) : (
                  <p>No configuration</p>
                )}

                <button
                  className="edit-btn"
                  onClick={() => {
                    const definition = fieldTypes.find(
                      (f) => f.type === field.type
                    );

                    setEditingField({
                      ...field,
                      definition,
                    });
                  }}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteField(field.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default App;