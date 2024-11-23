import React from "react";
import "../Register.css";

export const InputField = ({ label, placeholder, type = "text" }) => {
  return (
    <div className="inputContainer">
      <label className="inputLabel">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="inputField"
        aria-label={label}
      />
    </div>
  );
};
