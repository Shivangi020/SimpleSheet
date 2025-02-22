// Grid.tsx
import React, { useState, useRef, useEffect, useReducer } from "react";
import { Cell, GridProps } from "../types";
import CellComponent from "./Cell";
import { gridReducer, initialState } from "../gridReducer";

const Grid: React.FC<GridProps> = ({ rows, columns, onCellUpdate, onSort }) => {
  const [state, dispatch] = useReducer(gridReducer, initialState);
  const { selectedCells, activeCell } = state;

  const [columnWidths, setColumnWidths] = useState<number[]>(
    Array(columns).fill(120)
  );

  const startCell = useRef<{ row: number; col: number } | null>(null);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const resizingColumnIndex = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    resizingColumnIndex.current = index;
    startX.current = e.clientX;
    startWidth.current = columnWidths[index];

    // Disable text selection when resizing
    document.body.style.userSelect = "none";

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Perform resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (resizingColumnIndex.current === null) return;

    const index = resizingColumnIndex.current;
    const newWidth = Math.max(
      50,
      startWidth.current + (e.clientX - startX.current)
    );

    setColumnWidths((prevWidths) => {
      const newWidths = [...prevWidths];
      newWidths[index] = newWidth;
      return newWidths;
    });
  };

  // Stop resizing
  const handleMouseUp = () => {
    resizingColumnIndex.current = null;
    // Re-enable text selection after resizing
    document.body.style.userSelect = "auto";
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleCellClick = (row: number, col: number, e: React.MouseEvent) => {
    const key = getCellKey(row, col);

    if (e.shiftKey && startCell.current) {
      const newSelection: string[] = [];
      for (
        let r = Math.min(startCell.current.row, row);
        r <= Math.max(startCell.current.row, row);
        r++
      ) {
        for (
          let c = Math.min(startCell.current.col, col);
          c <= Math.max(startCell.current.col, col);
          c++
        ) {
          newSelection.push(getCellKey(r, c));
        }
      }
      dispatch({
        type: "SET_SELECTED_CELLS",
        payload: { cellIds: newSelection },
      });
    } else if (e.ctrlKey || e.metaKey) {
      const newSelection = selectedCells.includes(key)
        ? selectedCells.filter((id) => id !== key)
        : [...selectedCells, key];
      dispatch({
        type: "SET_SELECTED_CELLS",
        payload: { cellIds: newSelection },
      });
    } else {
      dispatch({ type: "SET_SELECTED_CELLS", payload: { cellIds: [key] } });
      startCell.current = { row, col };
    }
  };

  return (
    <div className="grid-container">
      <table className="grid">
        <thead>
          <tr>
            <th className="emptyCorner"></th> {/* Top-left corner empty */}
            {columnWidths.map((width, colIdx) => (
              <th key={colIdx} style={{ width }} className="header">
                <div className="headerCell">
                  Column {colIdx + 1}
                  <div
                    className="resizer"
                    onMouseDown={(e) => handleMouseDown(colIdx, e)}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              <td className="sticky-col">Row {rowIdx + 1}</td>
              {Array.from({ length: columns }).map((_, colIdx) => {
                const key = getCellKey(rowIdx, colIdx);
                return (
                  <td
                    onClick={(e) => {
                      handleCellClick(rowIdx, colIdx, e);
                    }}
                    key={key}
                    className={
                      selectedCells.includes(key) ? "selectedCell" : ""
                    }
                  >
                    <CellComponent
                      id={`${rowIdx}-${colIdx + 1}`}
                      value={1}
                      isSelected={false}
                      isActive={false}
                      onChange={(value) => console.log(value)}
                      type="text"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Grid;
