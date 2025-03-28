export interface Cell {
  id: string;
  value: string | number; // Actual cell value
  type: "text" | "number"; // Data type
}

export interface GridState {
  cells: Record<string, Cell>; // Map of cell id to cell data
  selectedCells: string[]; // Array of selected cell ids
  activeCell: string | null; // Currently active cell id
  undoStack: GridAction[]; // Stack of actions for undo
  redoStack: GridAction[]; // Stack of actions for redo
  sortState: "asc" | "desc";
}

Array<{
  cellId: string;
  value: string | number;
  previousValue: string | number;
}>;

export type GridAction =
  | {
      type: "UPDATE_CELL";
      payload: {
        cellId: string;
        value: string | number;
        previousValue: string | number;
      };
    }
  | {
      type: "UPDATE_SORT_DIRECTION";
      payload: {
        direction: "asc" | "desc";
      };
    }
  | {
      type: "SORT_COLUMN";
      payload: {
        columnId: string;
        direction: "asc" | "desc";
        cellsCopy: Record<string, Cell>;
      };
    }
  | {
      type: "MULTI_UPDATE";
      payload: {
        updates: Array<{
          cellId: string;
          value: string | number;
          previousValue: string | number;
        }>;
      };
    }
  | {
      type: "AUTO_FILL";
      payload: {
        updates: Array<{
          cellId: string;
          value: string | number;
          previousValue: string | number;
        }>;
      };
    }
  | {
      type: "SET_SELECTED_CELLS";
      payload: { cellIds: string[]; prevSelectedCellIds: string[] };
    }
  | { type: "SET_ACTIVE_CELL"; payload: { cellId: string } }
  | { type: "COPY" }
  | {
      type: "PASTE";
      payload: {
        cellIds: string[];
        values: string[][];
      };
    }
  | {
      type: "COPYPASTE";

      payload: {
        cellIds: string[]; // The target cells where pasting happens
        values: string[][]; // The copied values being pasted
        previousValues: Record<string, { value: string | number }>; // Store old values for Undo
      };
    }
  | {
      type: "UNDO" | "REDO";
    };

// Grid component props
export interface GridProps {
  rows: number;
  columns: number;
  // Removing these utility function types since they are already defined inside the grid  component
  // onCellUpdate: (cellId: string, value: string | number) => void;
  // onSort: (columnId: string, direction: "asc" | "desc") => void;
}

// Cell component props
export interface CellProps {
  id: string;
  value: string | number;
  type: "text" | "number";
  isSelected: boolean;
  isActive: boolean;
  onChange: (value: string | number) => void;
}

export interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSort: (direction: "asc" | "desc") => void;
}
