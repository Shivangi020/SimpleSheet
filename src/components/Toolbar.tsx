import React from "react";
import { ToolbarProps } from "../types";
import { MdUndo } from "react-icons/md";
import { MdRedo } from "react-icons/md";
import { AiOutlineSortAscending } from "react-icons/ai";
import { AiOutlineSortDescending } from "react-icons/ai";
import { useGrid } from "../ GridContext";
import { parseCellKey } from "../utils";

const Toolbar: React.FC<ToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSort,
}) => {
  const { state } = useGrid();
  const { activeCell, cells } = state;

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
        <div className="sortSelect">
          <div
            onClick={() => onSort("asc")}
            className={
              state.sortState === "asc" ? "sortBtn selectedSort" : "sortBtn"
            }
          >
            <AiOutlineSortAscending size={25} />
            <span>Asc</span>
          </div>
          <div
            onClick={() => onSort("desc")}
            className={
              state.sortState === "desc" ? "sortBtn selectedSort" : "sortBtn"
            }
          >
            <AiOutlineSortDescending size={25} />
            <span>Desc</span>
          </div>
        </div>

        <div className="activeCellData">
          {activeCell ? (
            <>
              <span>{`Row-${parseCellKey(activeCell)?.row}`}</span>
              <span>{`Col-${parseCellKey(activeCell)?.col}`}</span>
              <hr className="verticalDivider" />
              <span className="value">{cells[activeCell]?.value || ""}</span>
            </>
          ) : (
            <div className="placeholder">Selected cell</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
