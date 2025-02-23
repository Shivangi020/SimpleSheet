// Cell.tsx
import React, { useState, useEffect } from "react";
import { CellProps } from "../types";
import { actionKeys } from "../utils";

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
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!isActive) setIsEditing(false);
  }, [isActive]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number = e.target.value;
    if (type === "number") {
      if (isNaN(Number(newValue))) return;
      newValue = Number(newValue);
    }

    setInputValue(newValue);
  };

  const handleBlur = () => {
    if (type === "number" && isNaN(Number(inputValue))) return;
    onChange(type === "number" ? Number(inputValue) : inputValue);
    setIsEditing(false);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onChange(inputValue);
      setIsEditing(false);
    }
  };

  // This function listens for key presses on the parent <div> and enables editing mode (isEditing = true)
  // when users start typing, eliminating the need for a double-click to enter editing mode.
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // To Ignore Copy (Ctrl/Cmd + C) and Paste (Ctrl/Cmd + V)
    if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v")) {
      return;
    }
    if (!actionKeys.includes(e.key)) {
      setIsEditing(true);
    }
  };

  return (
    <div
      className={`cell ${isSelected ? "selected" : ""} ${
        isActive ? "active" : ""
      }`}
      onDoubleClick={() => setIsEditing(true)}
      onKeyDown={handleKeyPress}
      style={{
        backgroundColor: isSelected ? "#e3f2fd" : "white",
      }}
      tabIndex={0}
      id={id}
    >
      {isEditing ? (
        <input
          type={type === "number" ? "number" : "text"}
          value={inputValue}
          onBlur={handleBlur}
          onKeyDown={handleEnter}
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
