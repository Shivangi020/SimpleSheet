import React from "react";
import { ToolbarProps } from "../types";

const Toolbar: React.FC<ToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSort,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px",
        background: "#f3f3f3",
        borderBottom: "1px solid #ccc",
      }}
    >
      <button
        onClick={onUndo}
        disabled={!canUndo}
        style={{ padding: "5px", cursor: canUndo ? "pointer" : "not-allowed" }}
      >
        Undo
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        style={{ padding: "5px", cursor: canRedo ? "pointer" : "not-allowed" }}
      >
        Redo
      </button>
      <select
        onChange={(e) => onSort(e.target.value as "asc" | "desc")}
        style={{ padding: "5px" }}
      >
        <option value="" disabled selected>
          Sort
        </option>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
};

export default Toolbar;
