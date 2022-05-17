import React from "react";

const Checkbox = ({ checkboxValue, setCheckboxValue, label }) => {
  return (
    <div className="checkbox-container">
      <label className="checkbox bounce" htmlFor={label}>
        <input type="checkbox" name={label} id={label} />
        <svg viewBox="0 0 22 22">
          <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
        </svg>
        <div className="checkbox-label">{label}</div>
      </label>
    </div>
  );
};

export default Checkbox;
