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
