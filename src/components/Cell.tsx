// Cell.tsx
import React, { useState, useEffect } from "react";
import { CellProps } from "../types";

const CellComponent: React.FC<CellProps> = ({
  id,
  value,
  type,
  isSelected,
  isActive,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    if (!isActive) setIsEditing(false);
  }, [isActive]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number = e.target.value;

    if (type === "number") {
      if (isNaN(Number(newValue))) return; // Prevent non-numeric input
      newValue = Number(newValue);
    }

    setInputValue(newValue);
  };

  const handleBlur = () => {
    if (type === "number" && isNaN(Number(inputValue))) return;
    onChange(type === "number" ? Number(inputValue) : inputValue);
    setIsEditing(false);
  };

  return (
    <div
      className={`cell ${isSelected ? "selected" : ""} ${
        isActive ? "active" : ""
      }`}
      onClick={() => setIsEditing(true)}
      style={{
        // padding: "8px",
        // border: '1px solid #ddd',
        backgroundColor: isSelected ? "#e3f2fd" : "white",
        width: "100%",
        height: "100%",
      }}
    >
      {isEditing ? (
        <input
          type={type === "number" ? "number" : "text"}
          value={inputValue}
          onBlur={handleBlur}
          onChange={handleChange}
          autoFocus
          className="cellInput"
        />
      ) : (
        value
      )}
    </div>
  );
};

export default CellComponent;
