// App.tsx
import React from "react";
import Grid from "./components/Grid";
import "./App.css";
import Toolbar from "./components/Toolbar";

const App: React.FC = () => {
  const handleCellUpdate = (cellId: string, value: string | number) => {
    // will implement cell update
    console.log(cellId, value, "handleCellUpdate Function");
  };

  const handleSort = (columnId: string, direction: "asc" | "desc") => {
    // Implement sorting logic
    console.log(columnId, direction, "handleSort");
  };

  return (
    <div>
      <Toolbar
        canRedo={true}
        canUndo={true}
        onUndo={() => {}}
        onRedo={() => {}}
        onSort={() => {}}
      />
      <Grid
        rows={20}
        columns={20}
        onCellUpdate={handleCellUpdate}
        onSort={handleSort}
      />
    </div>
  );
};

export default App;
