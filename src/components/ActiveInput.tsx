import React, { useEffect, useState } from "react";

const ActiveInput: React.FC<{
  value?: string | number;
  handleCellValueUpdate?: (
    event:
      | React.FocusEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => void;
}> = ({ value = "", handleCellValueUpdate = () => {} }) => {
  const [inputVal, setInputVal] = useState<string | number>(value);

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  return (
    <input
      value={inputVal}
      className="activeCellInput"
      onChange={(e) => setInputVal(e.target.value)}
      onBlur={(e) => handleCellValueUpdate(e)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleCellValueUpdate(e);
        }
      }}
    ></input>
  );
};

export default ActiveInput;
