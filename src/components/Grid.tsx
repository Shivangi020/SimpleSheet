// Grid.tsx
import React, { useState, useRef, useEffect, useReducer } from "react";
import { Cell, GridProps } from "../types";
import CellComponent from "./Cell";
import { gridReducer, initialState } from "../gridReducer";

const Grid: React.FC<GridProps> = ({ rows, columns, onCellUpdate, onSort }) => {
  const [state, dispatch] = useReducer(gridReducer, initialState);
  const { selectedCells, cells, activeCell } = state;

  const [columnWidths, setColumnWidths] = useState<number[]>(
    Array(columns).fill(120)
  );

  const startCell = useRef<{ row: number; col: number } | null>(null);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const resizingColumnIndex = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<string | null>(null);
  const [isAutoFill, setIsAutoFill] = useState(false);

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

  const handleCellChange = (cellId: string, newValue: string | number) => {
    if (selectedCells.length > 1) {
      // Multi-update if multiple cells selected
      dispatch({
        type: "MULTI_UPDATE",
        payload: {
          updates: selectedCells.map((id) => ({
            cellId: id,
            value: newValue,
            previousValue: cells[id]?.value || "",
          })),
        },
      });
    } else {
      // Single cell update
      dispatch({
        type: "UPDATE_CELL",
        payload: {
          cellId,
          value: newValue,
          previousValue: cells[cellId]?.value || "",
        },
      });
    }
  };

  console.log({ selectedCells: selectedCells, cells: cells });

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        handleCopy();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        await handlePaste();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedCells]);

  const handleCopy = () => {
    if (selectedCells.length === 0) return;

    const copiedData = selectedCells
      .map((cellId) => cells[cellId]?.value || "")
      .join("\t");

    navigator.clipboard.writeText(copiedData);
    dispatch({ type: "COPY" });
  };

  const handlePaste = async () => {
    if (selectedCells.length === 0) return;

    const clipboardText = await navigator.clipboard.readText();
    const clipboardValues = clipboardText
      .split("\n")
      .map((row) => row.split("\t"));

    dispatch({
      type: "PASTE",
      payload: { cellIds: selectedCells, values: clipboardValues },
    });
  };

  const handleMouseDownOnCorner = (cellId: string) => {
    console.log("atleaste mouse down");
    setIsDragging(true);
    setDragStartCell(cellId);
    setIsAutoFill(true);
    document.body.style.userSelect = "none";
    document.addEventListener("mouseup", handleMouseUpFromCell);
  };

  const handleMouseOverOnCells = (cellId: string) => {
    if (!isDragging || !isAutoFill) return;

    const [startRow, startCol] = dragStartCell!.split("-").map(Number);
    const [endRow, endCol] = cellId.split("-").map(Number);

    const selectedCells = [];
    for (
      let r = Math.min(startRow, endRow);
      r <= Math.max(startRow, endRow);
      r++
    ) {
      for (
        let c = Math.min(startCol, endCol);
        c <= Math.max(startCol, endCol);
        c++
      ) {
        selectedCells.push(`${r}-${c}`);
      }
    }

    console.log(selectedCells);

    dispatch({
      type: "SET_SELECTED_CELLS",
      payload: { cellIds: selectedCells },
    });
  };

  const handleMouseUpFromCell = () => {
    setIsDragging(false);
    setIsAutoFill(false);
  };

  const handleSort = (colIdx: number) => {
    const newDirection = "asc";

    console.log(colIdx);
    // setSortState({ ...sortState, [colIdx]: newDirection });

    const columnId = `${colIdx}`;
    dispatch({
      type: "SORT_COLUMN",
      payload: { columnId: columnId, direction: newDirection },
    });
  };

  console.log(cells, "cells are updated");
  return (
    <div className="grid-container">
      <table className="grid">
        <thead>
          <tr>
            <th className="emptyCorner"></th> {/* Top-left corner empty */}
            {columnWidths.map((width, colIdx) => (
              <th key={colIdx} style={{ width }} className="header">
                <div className="headerCell">
                  Column {colIdx}{" "}
                  <span
                    onClick={() => {
                      handleSort(colIdx);
                    }}
                  >
                    🔼
                  </span>
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
              <td className="sticky-col">{rowIdx}</td>
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
                    onMouseOver={() => handleMouseOverOnCells(key)}
                  >
                    <CellComponent
                      id={key}
                      value={cells[key]?.value || ""}
                      type={cells[key]?.type || "text"}
                      isSelected={selectedCells.includes(key)}
                      isActive={false}
                      onChange={(value) => handleCellChange(key, value)}
                    />

                    <span
                      className="cornorSelect"
                      onMouseDown={() => handleMouseDownOnCorner(key)}
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
