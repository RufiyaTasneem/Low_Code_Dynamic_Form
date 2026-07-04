function ConfigPanel({ selectedField }) {
    if (!selectedField) {
        return <h2>Select a field</h2>;
    }

    return (
        <div>
            <h2>{selectedField.label} Configuration</h2>

            {selectedField.config.map((item) => (
                <div key={item.name}>
                    <label>{item.name}</label>

                    <input
                        type="text"
                        placeholder={item.name}
                    />
                </div>
            ))}
        </div>
    );
}

export default ConfigPanel;