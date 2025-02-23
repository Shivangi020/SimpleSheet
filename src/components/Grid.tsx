// Grid.tsx
import React, { useEffect, useRef, useState } from "react";
import { useGrid } from "../ GridContext";
import { GridProps } from "../types";
import CellComponent from "./Cell";
import { AiOutlineSortAscending } from "react-icons/ai";
import { AiOutlineSortDescending } from "react-icons/ai";

const Grid: React.FC<GridProps> = ({ rows, columns }) => {
  // const [state, dispatch] = useReducer(gridReducer, initialState);
  const { state, dispatch } = useGrid();
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
  const selectedCellsRef = useRef<string[]>(selectedCells);

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

  // handles cell click
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

      dispatch({ type: "SET_ACTIVE_CELL", payload: { cellId: key } });
      startCell.current = { row, col };
    }
  };

  const handleCopy = () => {
    if (selectedCells.length === 0) return;

    console.log(selectedCells, cells, activeCell, "copy paste 1");
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

  const handleCellChange = (cellId: string, newValue: string | number) => {
    if (!newValue) return;

    console.log(
      "am i being run when paste",
      cells,
      cellId,
      newValue,
      cells[cellId]?.value
    );
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

  // When clicking on bottom right corner
  // const handleMouseDownOnCorner = (cellId: string) => {
  //   setIsDragging(true);
  //   setDragStartCell(cellId);
  //   setIsAutoFill(true);
  //   document.body.style.userSelect = "none";

  //   console.log("hello  ");

  //   document.addEventListener("mouseup", () => handleMouseUpFromCell(cellId));
  // };

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

    console.log(selectedCells, "selectedCells");
    dispatch({
      type: "SET_SELECTED_CELLS",
      payload: { cellIds: selectedCells },
    });
  };

  const handleMouseUpFromCell = (dragStartCellId: string) => {
    setIsDragging(false);
    setIsAutoFill(false);
    document.body.style.userSelect = "auto";

    console.log(
      {
        dragStartCellId,
        selectedCells,
        selectedCellsRef,
        cells,
        activeCell,
      },
      "all this in mouse up"
    );
    if (!dragStartCellId) return;
    const updatedSelectedCells = selectedCellsRef.current; // Get the latest selectedCells

    let fillValues: { [key: string]: string | number } = {};
    updatedSelectedCells.forEach((cellId) => {
      if (cells[dragStartCellId]) {
        fillValues[cellId] = cells[dragStartCellId].value; // Copy-fill logic
      }
    });

    console.log(fillValues, "fillValues after ");

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

    document.removeEventListener("mouseup", () => handleMouseUpFromCell(""));
  };

  const handleMouseDownOnCorner = (cellId: string) => {
    setIsDragging(true);
    setDragStartCell(cellId);
    setIsAutoFill(true);
    document.body.style.userSelect = "none";

    console.log("hello");

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
                <div className="headerCell">
                  <span>Column {colIdx}</span>
                  <span
                    onClick={() => {
                      handleSort(colIdx);
                    }}
                  >
                    {state.sortState === "asc" ? (
                      <AiOutlineSortAscending size={20} />
                    ) : (
                      <AiOutlineSortDescending size={20} />
                    )}
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
                      isActive={activeCell === key}
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
