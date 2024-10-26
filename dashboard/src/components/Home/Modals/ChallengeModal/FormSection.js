import React from "react";
import styles from "./Form.module.css";
const FormSection = ({
  label,
  icon,
  inputType,
  placeholder,
  value,
  onChange,
  onClick,
  isDateTime,
}) => {
  return (
    <section
      className={styles.formSection}
      style={{ marginTop: isDateTime ? "0px" : undefined }}
    >
      <label className={styles.formLabel}>
        {label}
      </label>
      <div className={styles.formInputWrapper}>
        <span className={styles.formIcon} aria-hidden="true">
          {icon}
        </span>
        <input
          type={inputType}
          className={styles.formInput}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-label={label}
          onClick={onClick}
          readOnly={isDateTime}
        />
        {/* {label === "Choose date & time *" && (
          <span
            className={styles.textAreaIcon}
            onClick={onClick}
            aria-hidden="true"
          >
            🗓️
          </span>
        )} */}
      </div>
    </section>
  );
};

export default FormSection;
