// App.tsx
import React from "react";
import Grid from "./components/Grid";
import "./App.css";
import Toolbar from "./components/Toolbar";
import { useGrid } from "./ GridContext";

const App: React.FC = () => {
  const { state, dispatch } = useGrid();

  const handleUndo = () => dispatch({ type: "UNDO" });
  const handleRedo = () => dispatch({ type: "REDO" });
  const handleSortDirection = (direction: "asc" | "desc") =>
    dispatch({ type: "UPDATE_SORT_DIRECTION", payload: { direction } });

  return (
    <div>
      <Toolbar
        canRedo={state.redoStack.length > 0}
        canUndo={state.undoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSort={handleSortDirection}
      />
      <Grid rows={20} columns={20} />
    </div>
  );
};

export default App;
