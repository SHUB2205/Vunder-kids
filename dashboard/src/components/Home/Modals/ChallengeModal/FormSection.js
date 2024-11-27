import React from "react";
import styles from "./Form.module.css";
import SearchDropdown from "../../../Reusable/SearchDropdown/SearchDropdown";

const FormSection = ({
  label,
  icon,
  inputType,
  placeholder,
  value,
  onChange,
  onClick,
  isDateTime,
  type
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
        {type ? (
          <SearchDropdown 
            type={type}
            placeholder={placeholder}
            onSelect={(value) => onChange({ target: { value } })}
            icon={icon}
            isMultiple={type === 'players' ? true : false}
            
          />
        ) : (
          <>
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
            />
          </>
        )}
      </div>
    </section>
  );
};

export default FormSection;