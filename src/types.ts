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
}

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
      type: "SORT_COLUMN";
      payload: {
        columnId: string;
        direction: "asc" | "desc";
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
      type: "UNDO" | "REDO";
    };

// Grid component props
export interface GridProps {
  rows: number;
  columns: number;
  onCellUpdate: (cellId: string, value: string | number) => void;
  onSort: (columnId: string, direction: "asc" | "desc") => void;
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
