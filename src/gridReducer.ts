// gridReducer.ts
import { Cell, GridState, GridAction } from "./types";

export const initialState: GridState = {
  cells: {},
  selectedCells: [],
  activeCell: null,
  undoStack: [],
  redoStack: [],
};

export function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case "UPDATE_CELL":
      const { cellId, value, previousValue } = action.payload;
      const cellType = state.cells[cellId]?.type;

      // Prevent invalid data entry in number-only cells
      if (cellType === "number" && isNaN(Number(value))) {
        return state;
      }

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
    case "UNDO":
    // Implement undo logic
    case "REDO":

    case "COPY":
      return state;

    case "PASTE":
      const pastedCells = { ...state.cells };
      action.payload.cellIds.forEach((cellId, index) => {
        const row = Math.floor(index / action.payload.values[0].length);
        const col = index % action.payload.values[0].length;
        const newValue = action.payload.values[row]?.[col] || "";

        pastedCells[cellId] = { ...pastedCells[cellId], value: newValue };
      });

      return {
        ...state,
        cells: pastedCells,
        undoStack: [...state.undoStack, action],
        redoStack: [],
      };
    // Implement redo logic
    default:
      return state;
  }
}
