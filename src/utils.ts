import { Cell } from "./types";

export const actionKeys = [
  "Enter",
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Escape",
  "CapsLock",
  "Tab",
  "Backspace",
  "Delete",
  "Insert",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12", // Function keys
];

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
  // Extract rows with column values
  const rows = Object.keys(newCells)
    .filter((key) => key.endsWith(`-${columnId}`))
    .map((key) => ({
      key,
      rowId: parseInt(key.split("-")[0]),
      value: newCells[key]?.value || "",
    }));

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

  // Create a new mapping of rows after sorting
  const rowMapping: Record<number, number> = {};
  rows.forEach(({ rowId }, newIndex) => {
    rowMapping[rowId] = newIndex;
  });

  // Apply the row mapping to update cell positions
  const sortedCells: Record<string, Cell> = {};
  Object.keys(newCells).forEach((key) => {
    const [row, col] = key.split("-").map(Number);

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

export const getBottomRightCornerCell = (
  selectedCells: string[]
): string | null => {
  if (selectedCells.length === 0) return null; // No selection

  let maxRow = -Infinity;
  let maxCol = -Infinity;

  for (const cellKey of selectedCells) {
    const [r, c] = cellKey.split("-").map(Number);
    maxRow = Math.max(maxRow, r);
    maxCol = Math.max(maxCol, c);
  }

  const bottomRightCell = getCellKey(maxRow, maxCol);

  return bottomRightCell;
};

const convertToCSV = (data: Record<string, Cell>) => {
  let maxRow = 0;
  let maxCol = 0;

  Object.keys(data).forEach((key) => {
    const [row, col] = key.split("-").map(Number);
    console.log(row, col);
    if (row > maxRow) maxRow = row;
    if (col > maxCol) maxCol = col;
  });

  // Create a 2D array to represent the grid
  const grid = Array.from({ length: maxRow + 1 }, () =>
    Array(maxCol + 1).fill("")
  );

  // Fill the grid with data
  Object.keys(data).forEach((key) => {
    const [row, col] = key.split("-").map(Number);
    grid[row][col] = data[key].value;
  });

  // Convert the grid to CSV format
  const csvRows = grid.map((row) => {
    return row.join(",");
  });
  return csvRows.join("\n");
};

export const downloadCSV = (data: Record<string, Cell>): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const csvString = convertToCSV(data);
      const blob = new Blob([csvString], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "spreadsheet.csv";
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

const parseCSV = (csvString: string): Record<string, string>[] => {
  const lines = csvString.split("\n").filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  // Extract headers (first line of the CSV)
  let headers = lines[0].split(",").map((header) => header.trim());

  // If headers are empty, generate default headers (e.g., Column 1, Column 2, ...)
  if (headers.every((header) => header === "")) {
    headers = headers.map((_, index) => `Column ${index + 1}`);
  }

  // Process each line (starting from the second line)
  const result: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((value) => value.trim());

    // Create an object for the current row
    const row: Record<string, string> = {};

    // Map values to headers
    headers.forEach((header, index) => {
      // If the row has fewer columns than headers, fill missing values with an empty string
      row[header] = values[index] || "";
    });

    // If the row has more columns than headers, ignore the extra columns
    result.push(row);
  }

  console.log(result, csvString, "inside parse Cv");

  return result;
};

export const loadDataIntoApp = (parsedData: Record<string, string>[]) => {
  const newData: Array<{
    cellId: string;
    value: string | number;
    previousValue: string | number;
  }> = [];

  parsedData.forEach((row, rowIndex) => {
    Object.keys(row).forEach((header, colIndex) => {
      const key = `${rowIndex}-${colIndex}`; // Create "row-col" key
      newData.push({ value: row[header], cellId: key, previousValue: "" }); // Set the value
    });
  });

  return newData;
};

export const handleFileUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
): Promise<Record<string, string>[]> => {
  const file = event.target.files?.[0];
  if (!file) {
    throw new Error("No file selected");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csvString = e.target?.result as string;
        const parsedData = parseCSV(csvString);
        console.log(parsedData);
        resolve(parsedData); // Resolve the promise with the parsed data
      } catch (error) {
        console.error("Error parsing CSV:", error);
        reject(new Error("Invalid CSV file. Please check the format."));
      }
    };

    reader.onerror = () => {
      console.error("Error reading file");
      reject(new Error("Error reading file. Please try again."));
    };

    reader.readAsText(file); // Start reading the file
  });
};
