import { useEffect, useState } from "react";
import api from "../services/api";
import FieldCard from "./FieldCard";

function FieldPalette({ onSelect }) {
    const [fields, setFields] = useState([]);

    useEffect(() => {
        api.get("/field-types/")
            .then((response) => {
                setFields(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <div>
            <h2>Field Types</h2>

            {fields.map((field) => (
                <FieldCard
                    key={field.type}
                    field={field}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}

export default FieldPalette;