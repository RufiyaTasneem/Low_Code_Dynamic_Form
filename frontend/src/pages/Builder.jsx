import { useState } from "react";

function Builder() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    return (
        <div className="builder-page">
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
                    placeholder="Registration form..."
                />
            </div>

            <button>Create Form</button>
        </div>
    );
}

export default Builder;