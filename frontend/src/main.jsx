import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import PublicForm from "./pages/PublicForm";

const root = createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/f/:token" element={<PublicForm />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
