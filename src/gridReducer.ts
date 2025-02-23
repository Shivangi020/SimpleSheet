// gridReducer.ts
import { GridAction, GridState } from "./types";
import { applyPaste, sortAndMapRows } from "./utils";

export const initialState: GridState = {
  cells: {},
  selectedCells: [],
  activeCell: null,
  undoStack: [],
  redoStack: [],
  sortState: "asc",
};

export function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case "UPDATE_CELL":
      const { cellId, value } = action.payload;
      const cellType = state.cells[cellId]?.type;
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
      };

    case "MULTI_UPDATE":
      const updatedCells = { ...state.cells };
      action.payload.updates.forEach(({ cellId, value }) => {
        const cellType = updatedCells[cellId]?.type;
        if (cellType === "number" && isNaN(Number(value))) {
          return;
        }
        updatedCells[cellId] = { ...updatedCells[cellId], value };
      });

      return {
        ...state,
        cells: updatedCells,
        undoStack: [...state.undoStack, action],
      };

    case "SET_ACTIVE_CELL":
      return { ...state, activeCell: action.payload.cellId };

    case "SET_SELECTED_CELLS":
      return { ...state, selectedCells: action.payload.cellIds };

    case "UPDATE_SORT_DIRECTION":
      return { ...state, sortState: action.payload.direction };
    case "UNDO": {
      if (state.undoStack.length === 0) return state;
      const lastAction = state.undoStack[state.undoStack.length - 1];

      if (lastAction.type === "UPDATE_CELL") {
        const { cellId, previousValue } = lastAction.payload;

        return {
          ...state,
          cells: {
            ...state.cells,
            [cellId]: { ...state.cells[cellId], value: previousValue },
          },
          activeCell: cellId,
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
      } else if (lastAction.type === "AUTO_FILL") {
        const { updates } = lastAction.payload;
        const autoFilledCells = { ...state.cells };
        updates.forEach(({ cellId, previousValue }) => {
          autoFilledCells[cellId] = {
            ...autoFilledCells[cellId],
            value: previousValue,
          };
        });

        return {
          ...state,
          cells: autoFilledCells,
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [
            ...state.redoStack,
            lastAction, // Save action for redo
          ],
        };
      } else if (lastAction.type === "SORT_COLUMN") {
        const { cellsCopy, direction } = lastAction.payload;
        const sortedCellsForRedo = { ...state.cells };
        return {
          ...state,
          cells: cellsCopy,
          sortState: direction,
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [
            ...state.redoStack,
            {
              ...lastAction,
              payload: { ...lastAction.payload, cellsCopy: sortedCellsForRedo },
            },
          ],
        };
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
        const { cellIds, values } = lastRedo.payload;
        const { pastedCells } = applyPaste(values, cellIds, state.cells);

        return {
          ...state,
          cells: pastedCells, // Reapply paste
          redoStack: state.redoStack.slice(0, -1), // Remove from redo stack
          undoStack: [...state.undoStack, lastRedo], // Move back to undo stack
        };
      } else if (lastRedo.type === "AUTO_FILL") {
        const { updates } = lastRedo.payload;
        const autoFilledCells = { ...state.cells };
        updates.forEach(({ cellId, value }) => {
          autoFilledCells[cellId] = {
            ...autoFilledCells[cellId],
            value: value,
          };
        });
        return {
          ...state,
          cells: autoFilledCells,
          redoStack: state.redoStack.slice(0, -1),
          undoStack: [...state.undoStack, lastRedo],
        };
      } else if (lastRedo.type === "SORT_COLUMN") {
        const { cellsCopy } = lastRedo.payload;
        const cellCopyForUndo = { ...state.cells };
        return {
          ...state,
          cells: cellsCopy,
          redoStack: state.redoStack.slice(0, -1),
          undoStack: [
            ...state.undoStack,
            {
              ...lastRedo,
              payload: { ...lastRedo.payload, cellsCopy: cellCopyForUndo },
            },
          ],
        };
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
        undoStack: [...state.undoStack, action],
      };

    case "PASTE":
      const copiedValues = action.payload.values;
      const cellIds = action.payload.cellIds;

      const { pastedCells, previousValues } = applyPaste(
        copiedValues,
        cellIds,
        state.cells
      );

      return {
        ...state,
        cells: pastedCells,
        undoStack: [
          ...state.undoStack,
          {
            type: "COPYPASTE", // action only to undo or redo paste action (as required previous state)
            payload: { cellIds, values: copiedValues, previousValues },
          },
        ],
        redoStack: [],
      };

    case "SORT_COLUMN": {
      const { columnId, direction } = action.payload;
      const newCells = { ...state.cells };

      const sortedCells = sortAndMapRows(newCells, columnId, direction);

      return {
        ...state,
        cells: sortedCells,
        undoStack: [...state.undoStack, action],
      };
    }

    default:
      return state;
  }
}
