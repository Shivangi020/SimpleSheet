// App.tsx
import React from 'react';
import Grid from './components/Grid';
import './App.css'

const App: React.FC = () => {


  const handleCellUpdate = (cellId: string, value: string | number) => {
   // will implement cell update function
  };

  const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
    // Implement sorting logic
  };

  return (
    <div>
     
      <Grid
        rows={20}
        columns={20}
        onCellUpdate={handleCellUpdate}
        onSort={handleSort}
      />
    </div>
  );
};

export default App