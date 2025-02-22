// Cell.tsx
import React, { useState, useEffect } from 'react';
import { CellProps } from '../types';

const CellComponent: React.FC<CellProps> = ({
  id,
  value,
  type,
  isSelected,
  isActive,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value?.toString());

  useEffect(() => {
    if (!isActive) setIsEditing(false);
  }, [isActive]);

  const handleBlur = () => {
    if (type === 'number' && isNaN(Number(inputValue))) return;
    onChange(type === 'number' ? Number(inputValue) : inputValue);
    setIsEditing(false);
  };

  return (
    <div
      className={`cell ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`}
      onClick={() => setIsEditing(true)}
      style={{
        padding: '8px',
        // border: '1px solid #ddd',
        backgroundColor: isSelected ? '#e3f2fd' : 'white',
        width:'100%',
        height:'100%'
      }}
    >
      {/* {isEditing ? (
        <input
          type={type}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          style={{ width: '100%' }}
        />
      ) : (
        value
      )} */}

      {value}
    </div>
  );
};

export default CellComponent