// Grid.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Cell, GridProps } from '../types';
import CellComponent from './Cell';

const Grid: React.FC<GridProps> = ({
  rows,
  columns,
  onCellUpdate,
  onSort,
}) => {
  const [columnWidths, setColumnWidths] = useState<number[]>(
    Array(columns).fill(120)
  );
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);


  console.log(columnWidths)
  

  return (
    <div className="grid-container">
    <table className="grid">
      <thead>
        <tr>
          <th className="crossHeader"></th> {/* Top-left corner empty */}
          {columnWidths.map((width, colIdx) => (
            <th key={colIdx} style={{ width }} className='header'>
              Column {colIdx + 1}
              <div className="resizer"  />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx}>
            <td className="sticky-col">Row {rowIdx + 1}</td>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <td>
                <CellComponent
              id={`${rowIdx}-${colIdx + 1}`}
              value={1}
              isSelected={false}
              isActive={false}
              onChange={(value) =>
                console.log(value)
              }
              type ='text'
            />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
};


export  default Grid