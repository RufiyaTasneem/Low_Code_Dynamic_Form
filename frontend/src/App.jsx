import { useState } from "react";

import FieldPalette from "./components/FieldPalette";
import ConfigPanel from "./components/ConfigPanel";

function App() {
  const [selectedField, setSelectedField] = useState(null);

  return (
    <div style={{ display: "flex", gap: "40px", padding: "20px" }}>
      <FieldPalette onSelect={setSelectedField} />

      <ConfigPanel selectedField={selectedField} />
    </div>
  );
}

export default App;