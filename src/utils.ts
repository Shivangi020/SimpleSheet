import { Cell } from "./types";

export const applyPaste = (
  copiedValues: string[][],
  cellIds: string[],
  cells: Record<string, Cell>
) => {
  const pastedCells = { ...cells };
  const previousValues: Record<string, { value: string | number }> = {};

  if (copiedValues.length === 1 && copiedValues[0].length === 1) {
    // Single cell copy -> Apply to all selected cells
    const copiedValue = copiedValues[0][0];

    cellIds.forEach((cellId) => {
      previousValues[cellId] = { value: pastedCells[cellId]?.value || "" };
      pastedCells[cellId] = { ...pastedCells[cellId], value: copiedValue };
    });
  } else {
    // Multi-cell copy -> Structured pasting
    cellIds.forEach((cellId, index) => {
      const row = Math.floor(index / copiedValues[0].length);
      const col = index % copiedValues[0].length;
      const newValue = copiedValues[row]?.[col] || "";

      previousValues[cellId] = { value: pastedCells[cellId]?.value || "" };
      pastedCells[cellId] = { ...pastedCells[cellId], value: newValue };
    });
  }

  return { pastedCells, previousValues };
};

export const sortAndMapRows = (
  newCells: Record<string, Cell>,
  columnId: string,
  direction: "asc" | "desc"
): Record<string, Cell> => {
  console.log(columnId, "debug columnId");

  // Extract rows with column values
  const rows = Object.keys(newCells)
    .filter((key) => key.endsWith(`-${columnId}`))
    .map((key) => ({
      key,
      rowId: parseInt(key.split("-")[0]),
      value: newCells[key]?.value || "",
    }));

  console.log(rows, "debug rows");

  // Sort rows based on column value (number or string)
  rows.sort((a, b) => {
    const valA = a.value;
    const valB = b.value;

    if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
      return direction === "asc"
        ? Number(valA) - Number(valB)
        : Number(valB) - Number(valA);
    }
    return direction === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  console.log(rows, "debug sortedrows");

  // Create a new mapping of rows after sorting
  const rowMapping: Record<number, number> = {};
  rows.forEach(({ rowId }, newIndex) => {
    rowMapping[rowId] = newIndex;
  });

  console.log(rowMapping, "debug rowsMapping");

  // Apply the row mapping to update cell positions
  const sortedCells: Record<string, Cell> = {};
  Object.keys(newCells).forEach((key) => {
    const [row, col] = key.split("-").map(Number);
    console.log(row, col, "debug each");
    if (rowMapping[row] !== undefined) {
      const newKey = `${rowMapping[row]}-${col}`;
      sortedCells[newKey] = {
        ...newCells[key],
        id: newKey,
      };
    } else {
      sortedCells[key] = newCells[key];
    }
  });

  return sortedCells;
};

export const getCellKey = (row: number, col: number) => `${row}-${col}`;

export const parseCellKey = (
  cellKey: string | null
): { row: number; col: number } | null => {
  if (!cellKey) return null;
  const [row, col] = cellKey.split("-").map(Number);
  return { row, col };
};
