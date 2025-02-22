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
      return {
        ...state,
        cells: {
          ...state.cells,
          [action.payload.cellId!]: {
            ...state.cells[action.payload.cellId!],
            value: action.payload.value!,
          },
        },
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
    // Implement redo logic
    default:
      return state;
  }
}
