// Grid.tsx
import React, { useEffect, useRef, useState } from "react";
import { useGrid } from "../ GridContext";
import { GridProps } from "../types";
import CellComponent from "./Cell";
import { TiArrowSortedDown } from "react-icons/ti";
import { TiArrowSortedUp } from "react-icons/ti";
import { getBottomRightCornerCell, getCellKey } from "../utils";

const Grid: React.FC<GridProps> = ({ rows, columns }) => {
  const { state, dispatch } = useGrid();
  const { selectedCells, cells, activeCell } = state;

  // Initializing  column width
  const [columnWidths, setColumnWidths] = useState<number[]>(
    Array(columns).fill(120)
  );

  // States for column resize purpose
  const resizingColumnIndex = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  // States for dragging over cells and autofilling them or multi select cell
  const selectedCellsRef = useRef<string[]>(selectedCells);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<string | null>(null);
  const [isAutoFill, setIsAutoFill] = useState(false);
  const startCell = useRef<{ row: number; col: number } | null>(null);

  // CornorKey state to show blue colored cornor on right bottom cornor cell
  const [cornorKey, setCornorKey] = useState<string | null>(null);

  // Functions required Resizing column --> handleMouseDown , handleMouseMove ,handleMouseUp
  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    resizingColumnIndex.current = index;
    startX.current = e.clientX;
    startWidth.current = columnWidths[index];
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
    document.body.style.userSelect = "auto";
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

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

  // Function for handling Cell click with single Click , Shift + click , Ctrl/Cmd + click
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
      document.body.style.userSelect = "none";
      const bottomRightCell = getBottomRightCornerCell(newSelection);
      setCornorKey(bottomRightCell);
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
      setCornorKey(key);
    } else {
      dispatch({ type: "SET_SELECTED_CELLS", payload: { cellIds: [key] } });
      dispatch({ type: "SET_ACTIVE_CELL", payload: { cellId: key } });
      startCell.current = { row, col };
      setCornorKey(key);
    }
  };

  // This function  is called cell value updated (onBlur  , onKeyDown)
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

  // Functions to control Click and drag the bottom-right corner of active cells
  // ---> (handleMouseOverOnCells ,handleMouseUpFromCell ,handleMouseDownOnCorner)
  const handleMouseOverOnCells = (cellId: string) => {
    if (!isDragging || !isAutoFill) return;

    const [startRow, startCol] = dragStartCell!.split("-").map(Number);
    const [endRow, endCol] = cellId.split("-").map(Number);

    const bottomRightCell = `${Math.max(startRow, endRow)}-${Math.max(
      startCol,
      endCol
    )}`;
    const dragOverCells = new Set([...selectedCells]);
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
        dragOverCells.add(`${r}-${c}`);
      }
    }

    setCornorKey(bottomRightCell);

    dispatch({
      type: "SET_SELECTED_CELLS",
      payload: { cellIds: [...dragOverCells] },
    });
  };

  const handleMouseUpFromCell = (dragStartCellId: string) => {
    setIsDragging(false);
    setIsAutoFill(false);
    document.body.style.userSelect = "auto";
    if (!dragStartCellId) return;
    const updatedSelectedCells = selectedCellsRef.current; // Get the latest selectedCells

    let fillValues: { [key: string]: string | number } = {};
    updatedSelectedCells.forEach((cellId) => {
      if (cells[dragStartCellId]) {
        fillValues[cellId] = cells[dragStartCellId].value; // Copy-fill logic
      }
    });

    // Run auto fill if there is some values
    if (Object.keys(fillValues)?.length > 0) {
      dispatch({
        type: "AUTO_FILL",
        payload: {
          updates: Object.entries(fillValues).map(([cellId, value]) => ({
            cellId,
            value,
            previousValue: cells[cellId]?.value || "",
          })),
        },
      });
    }

    document.removeEventListener("mouseup", () => handleMouseUpFromCell(""));
  };

  const handleMouseDownOnCorner = (cellId: string) => {
    setIsDragging(true);
    setDragStartCell(cellId);
    setIsAutoFill(true);
    document.body.style.userSelect = "none";

    const onMouseUp = () => handleMouseUpFromCell(cellId);

    document.addEventListener("mouseup", onMouseUp);

    // Properly remove listener after execution
    document.addEventListener("mouseup", function removeListener() {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseup", removeListener); // Remove itself
    });
  };

  const handleSort = (colIdx: number) => {
    const newDirection = state.sortState;
    const columnId = `${colIdx}`;
    const cellsCopy = { ...state.cells };
    dispatch({
      type: "SORT_COLUMN",
      payload: { columnId: columnId, direction: newDirection, cellsCopy },
    });
  };

  useEffect(() => {
    selectedCellsRef.current = selectedCells;
  }, [selectedCells]);

  // UseEffect runs for handle copy and paste
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

  return (
    <div className="grid-container">
      <table className="grid">
        <thead>
          <tr>
            <th className="emptyCorner"></th> {/* Top-left corner empty */}
            {columnWidths.map((width, colIdx) => (
              <th key={colIdx} style={{ width }} className="header">
                <div
                  className="headerCell"
                  onClick={() => {
                    handleSort(colIdx);
                  }}
                >
                  <span>Column {colIdx}</span>
                  {state.sortState === "asc" ? (
                    <TiArrowSortedDown size={18} />
                  ) : (
                    <TiArrowSortedUp size={18} />
                  )}
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
                      isActive={activeCell === key}
                      onChange={(value) => handleCellChange(key, value)}
                    />

                    <span
                      className={
                        cornorKey === key
                          ? "cornorSelect activeCornor"
                          : "cornorSelect"
                      }
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDownOnCorner(key);
                      }}
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
