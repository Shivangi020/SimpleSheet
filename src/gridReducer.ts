// gridReducer.ts
import { Cell, GridState, GridAction } from "./types";

export const initialState: GridState = {
  cells: {},
  selectedCells: [],
  activeCell: null,
  undoStack: [],
  redoStack: [],
  sortState: { direction: "asc" },
};

export function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case "UPDATE_CELL":
      const { cellId, value } = action.payload;
      const cellType = state.cells[cellId]?.type;

      // Prevent invalid data entry in number-only cells
      if (cellType === "number" && isNaN(Number(value))) {
        return state;
      }

      console.log("updating single cell");
      return {
        ...state,
        cells: {
          ...state.cells,
          [cellId]: { ...state.cells[cellId], value },
        },
        undoStack: [...state.undoStack, action],
        redoStack: [],
      };

    case "MULTI_UPDATE":
      const updatedCells = { ...state.cells };

      action.payload.updates.forEach(({ cellId, value }) => {
        const cellType = updatedCells[cellId]?.type;

        if (cellType === "number" && isNaN(Number(value))) {
          return; // Skip invalid input
        }

        updatedCells[cellId] = { ...updatedCells[cellId], value };
      });

      return {
        ...state,
        cells: updatedCells,
        undoStack: [...state.undoStack, action],
        redoStack: [],
      };

    case "SET_ACTIVE_CELL":
      return { ...state, activeCell: action.payload.cellId };

    case "SET_SELECTED_CELLS":
      return { ...state, selectedCells: action.payload.cellIds };

    case "UNDO": {
      if (state.undoStack.length === 0) return state;

      const lastAction = state.undoStack[state.undoStack.length - 1];
      console.log(lastAction, "undo debug65");
      if (lastAction.type === "UPDATE_CELL") {
        const { cellId, previousValue } = lastAction.payload;
        console.log(cellId, previousValue, "undo debug 68");
        return {
          ...state,
          cells: {
            ...state.cells,
            [cellId]: { ...state.cells[cellId], value: previousValue },
          },
          undoStack: state.undoStack.slice(0, -1), // Remove last action
          redoStack: [...state.redoStack, lastAction], // Push to redo stack
        };
      } else if (lastAction.type === "COPYPASTE") {
        const { previousValues } = lastAction.payload;
        const restoredCells = { ...state.cells };
        Object.entries(previousValues).forEach(([cellId, data]) => {
          restoredCells[cellId] = {
            ...restoredCells[cellId],
            value: data.value,
          };
        });
        return {
          ...state,
          cells: restoredCells, // Restore previous values
          undoStack: state.undoStack.slice(0, -1), // Remove from undo stack
          redoStack: [...state.redoStack, lastAction], // Move to redo stack
        };
      } else if (lastAction.type === "MULTI_UPDATE") {
        console.log(lastAction.payload, "Multiupdate");
      }
      return state;
    }

    case "REDO": {
      if (state.redoStack.length === 0) return state;

      const lastRedo = state.redoStack[state.redoStack.length - 1];
      if (lastRedo.type === "UPDATE_CELL") {
        const { cellId, value } = lastRedo.payload;
        return {
          ...state,
          cells: {
            ...state.cells,
            [cellId]: { ...state.cells[cellId], value },
          },
          redoStack: state.redoStack.slice(0, -1), // Remove last redo action
          undoStack: [...state.undoStack, lastRedo], // Push back to undo stack
        };
      } else if (lastRedo.type === "COPYPASTE") {
        // const { cellIds, values } = lastRedo.payload;
        // const redoCells = { ...state.cells };

        console.log(lastRedo.payload, "last redo in case copyPaste");
      }

      return state;
    }

    case "COPY":
      return state;

    case "AUTO_FILL":
      const newCells = { ...state.cells };
      action.payload.updates.forEach(({ cellId, value }) => {
        newCells[cellId] = { ...newCells[cellId], value };
      });

      return {
        ...state,
        cells: newCells,
      };
    case "PASTE":
      const pastedCells = { ...state.cells };
      const copiedValues = action.payload.values; // Could be a 2D array or a single value
      const cellIds = action.payload.cellIds;

      // Store previous values for undo
      const previousValues: Record<string, { value: string | number }> = {};

      if (copiedValues.length === 1 && copiedValues[0].length === 1) {
        // Single cell copy -> Apply to all selected cells
        const copiedValue = copiedValues[0][0];

        cellIds.forEach((cellId) => {
          previousValues[cellId] = { value: pastedCells[cellId]?.value || "" };
          pastedCells[cellId] = { ...pastedCells[cellId], value: copiedValue };
        });
      } else {
        // Multi-cell copy -> Structured pasting
        cellIds.forEach((cellId, index) => {
          const row = Math.floor(index / copiedValues[0].length);
          const col = index % copiedValues[0].length;
          const newValue = copiedValues[row]?.[col] || "";

          previousValues[cellId] = { value: pastedCells[cellId]?.value || "" };
          pastedCells[cellId] = { ...pastedCells[cellId], value: newValue };
        });
      }

      return {
        ...state,
        cells: pastedCells,
        undoStack: [
          ...state.undoStack,
          {
            type: "COPYPASTE",
            payload: { cellIds, values: copiedValues, previousValues },
          }, // Save previous state for undo
        ],
        redoStack: [],
      };

    case "SORT_COLUMN": {
      const { columnId, direction } = action.payload;
      const newCells = { ...state.cells };

      console.log(columnId, "debug columnId");
      // Extract rows with column values
      const rows = Object.keys(newCells)
        .filter((key) => key.endsWith(`-${columnId}`)) // Find cells in the sorted column
        .map((key) => ({
          key,
          rowId: parseInt(key.split("-")[0]), // Extract row index
          value: newCells[key]?.value || "",
        }));

      console.log(rows, "debug rows");
      // Sort rows based on column value (number or string)
      rows.sort((a, b) => {
        const valA = a.value;
        const valB = b.value;

        if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
          return direction === "asc"
            ? Number(valA) - Number(valB)
            : Number(valB) - Number(valA);
        }
        return direction === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });

      console.log(rows, "debug sortedrows");
      // Create a new mapping of rows after sorting
      const rowMapping: { [oldRowId: number]: number } = {};
      rows.forEach(({ rowId }, newIndex) => {
        rowMapping[rowId] = newIndex; // Map old row index to new row index
      });

      console.log(rowMapping, "debug rowsMapping");
      // Apply the row mapping to update cell positions
      const updatedCells: Record<string, Cell> = {};
      Object.keys(newCells).forEach((key) => {
        const [row, col] = key.split("-").map(Number);
        console.log(row, col, "debug each");
        if (rowMapping[row] !== undefined) {
          const newKey = `${rowMapping[row]}-${col}`;
          updatedCells[newKey] = {
            ...newCells[key], // Preserve all cell properties
            id: newKey, // Update the ID to reflect the new row index
          };
        } else {
          updatedCells[key] = newCells[key]; // Preserve other cells
        }
      });

      return { ...state, cells: updatedCells };
    }

    default:
      return state;
  }
}
