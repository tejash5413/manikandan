import React from "react";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";

// Sanitize LaTeX input and auto-wrap expressions smartly
const sanitizeLatexInput = (input) => {
    return input
        .replace(/\\\((.*?)\\\)/g, (_, eq) => `$${eq.trim()}$`)  // Convert \(...\) to $...$
        .replace(/\\\[(.*?)\\\]/g, (_, eq) => `$$${eq.trim()}$$`) // Convert \[...\] to $$...$$
        .replace(/\s+\\/, ' \\'); // Ensure space before LaTeX commands if missing
};

// Render input safely with LaTeX and fallback to text
const renderWithLatex = (input) => {
    const parts = sanitizeLatexInput(input).split(/(\${1,2}[^$]+\${1,2})/g);
    return parts.map((part, index) => {
        if (/^\${1,2}[^$]+\${1,2}$/.test(part)) {
            return <Latex key={index}>{part}</Latex>;
        } else {
            return <span key={index}>{part}</span>;
        }
    });
};

const LiveLatexInput = ({ value, onChange, placeholder }) => {
    const handleChange = (e) => {
        const rawInput = e.target.value;
        onChange(rawInput); // Store raw input; formatting is only for preview
    };

    return (
        <div className="mb-3">
            <label className="form-label fw-semibold">Enter Equation (LaTeX):</label>
            <textarea
                rows={4}
                className="form-control"
                value={value}
                onChange={handleChange}
                placeholder={placeholder || "Type LaTeX using \\( ... \\), \\[ ... \\] or $...$"}
                style={{ fontFamily: "monospace" }}
            />

            <div
                className="mt-3 p-3 bg-light border rounded"
                style={{ whiteSpace: "normal", overflowX: "auto" }}
            >
                <p className="fw-semibold mb-2">Preview:</p>
                <div>{renderWithLatex(value)}</div>
            </div>
        </div>
    );
};

export default LiveLatexInput;
