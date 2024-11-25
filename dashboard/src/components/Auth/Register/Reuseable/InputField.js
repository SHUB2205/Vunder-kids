import React from "react";
import "../Register.css";

export const InputField = ({ label, placeholder, type = "text", name, value, onChange }) => {
  return (
    <div className="inputContainer">
      <label className="inputLabel" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name} // Pass the name prop
        value={value} // Pass the value prop
        onChange={onChange} // Pass the onChange handler
        placeholder={placeholder}
        className="inputField"
        aria-label={label}
      />
    </div>
  );
};
