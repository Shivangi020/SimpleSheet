import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { gridReducer, initialState } from "./gridReducer";
import { GridState, GridAction } from "./types";

// Define the context type
interface GridContextType {
  state: GridState;
  dispatch: React.Dispatch<GridAction>;
}

// Create the context
const GridContext = createContext<GridContextType | undefined>(undefined);

// Context provider component
export const GridProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gridReducer, initialState);

  return (
    <GridContext.Provider value={{ state, dispatch }}>
      {children}
    </GridContext.Provider>
  );
};

// Custom hook to use the context
export const useGrid = () => {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error("useGrid must be used within a GridProvider");
  }
  return context;
};
