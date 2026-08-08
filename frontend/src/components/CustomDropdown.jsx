import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import "./CustomDropdown.css";

export default function CustomDropdown({
    id,
    value,
    options = [],
    placeholder = "Select...",
    onChange,
    disabled = false,
    required = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);
    const displayLabel = selectedOption ? selectedOption.label : (value || placeholder);

    return (
        <div className="custom-dropdown-container" ref={containerRef}>
            <div
                id={id}
                className={`custom-dropdown-trigger ${isOpen ? "open" : ""} ${disabled ? "disabled" : ""}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        !disabled && setIsOpen(!isOpen);
                    } else if (e.key === "Escape") {
                        setIsOpen(false);
                    }
                }}
            >
                <span className={!value ? "placeholder-text" : "selected-text"}>
                    {displayLabel}
                </span>
                <ChevronDown size={18} className={`dropdown-chevron ${isOpen ? "rotated" : ""}`} />
            </div>

            {required && (
                <input
                    type="text"
                    value={value || ""}
                    required={required}
                    readOnly
                    tabIndex={-1}
                    style={{
                        position: "absolute",
                        opacity: 0,
                        width: 1,
                        height: 1,
                        bottom: 0,
                        left: 0,
                        pointerEvents: "none",
                    }}
                />
            )}

            {isOpen && (
                <div className="custom-dropdown-menu">
                    <div
                        className={`custom-dropdown-option ${!value ? "selected" : ""}`}
                        onClick={() => {
                            onChange("");
                            setIsOpen(false);
                        }}
                    >
                        {placeholder}
                    </div>
                    {options.map((opt, idx) => (
                        <div
                            key={idx}
                            className={`custom-dropdown-option ${opt.value === value ? "selected" : ""}`}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
