import React from "react";
import { ToolbarProps } from "../types";
import { MdUndo } from "react-icons/md";
import { MdRedo } from "react-icons/md";

const Toolbar: React.FC<ToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSort,
}) => {
  return (
    <div className="toolbarCn">
      <div className="toolbar">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            padding: "5px",
            cursor: canUndo ? "pointer" : "not-allowed",
            color: canUndo ? " #007bff" : "#949494",
          }}
          className="toolbarBtn"
        >
          <MdUndo size={25} />
          <span>Undo</span>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            padding: "5px",
            cursor: canRedo ? "pointer" : "not-allowed",
            color: canRedo ? " #007bff" : "#949494",
          }}
          className="toolbarBtn"
        >
          <MdRedo size={25} />
          <span>Redo</span>
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
    </div>
  );
};

export default Toolbar;
