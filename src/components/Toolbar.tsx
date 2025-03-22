import React, { useState } from "react";
import { ToolbarProps } from "../types";
import { MdUndo } from "react-icons/md";
import { MdRedo } from "react-icons/md";
import { AiOutlineSortAscending } from "react-icons/ai";
import { AiOutlineSortDescending } from "react-icons/ai";
import { CiExport } from "react-icons/ci";
import { CiImport } from "react-icons/ci";
import { useGrid } from "../ GridContext";
import {
  downloadCSV,
  handleFileUpload,
  loadDataIntoApp,
  parseCellKey,
} from "../utils";

const Toolbar: React.FC<ToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSort,
}) => {
  const { state, dispatch } = useGrid();
  const { activeCell, cells } = state;
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await downloadCSV(cells);
    } catch (error) {
      console.error("Error during CSV download:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCSVFileImport = async () => {
    setIsImporting(true);
    const fileInput = document.getElementById("attachment");
    fileInput?.click();
  };

  const handleInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const toUpload = await handleFileUpload(event);
      const data = loadDataIntoApp(toUpload);
      dispatch({
        type: "MULTI_UPDATE",
        payload: {
          updates: data,
        },
      });
    } catch (e) {
      console.log(e);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="toolbarCn">
      <div className="toolbar">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            padding: "5px",
            cursor: canUndo ? "pointer" : "not-allowed",
            color: canUndo ? " #007bff" : "#949494",
          }}
          className="toolbarBtn"
        >
          <MdUndo size={25} />
          <span>Undo</span>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            padding: "5px",
            cursor: canRedo ? "pointer" : "not-allowed",
            color: canRedo ? " #007bff" : "#949494",
          }}
          className="toolbarBtn"
        >
          <MdRedo size={25} />
          <span>Redo</span>
        </button>
        <div className="sortSelect">
          <div
            onClick={() => onSort("asc")}
            className={
              state.sortState === "asc" ? "sortBtn selectedSort" : "sortBtn"
            }
          >
            <AiOutlineSortAscending size={25} />
            <span>Asc</span>
          </div>
          <div
            onClick={() => onSort("desc")}
            className={
              state.sortState === "desc" ? "sortBtn selectedSort" : "sortBtn"
            }
          >
            <AiOutlineSortDescending size={25} />
            <span>Desc</span>
          </div>
        </div>

        <div className="activeCellData">
          {activeCell ? (
            <>
              <span>{`Row-${parseCellKey(activeCell)?.row}`}</span>
              <span>{`Col-${parseCellKey(activeCell)?.col}`}</span>
              <hr className="verticalDivider" />
              <span className="value">{cells[activeCell]?.value || ""}</span>
            </>
          ) : (
            <div className="placeholder">Selected cell</div>
          )}
        </div>
      </div>

      <div className="toolbar2">
        <button className="toolbarBtn actionBtn" onClick={handleDownload}>
          <CiExport size={20} strokeWidth={1} />
          <span style={{ fontWeight: "400" }}>
            {isExporting ? "Exporting..." : "Export"}
          </span>
        </button>

        <button className="toolbarBtn actionBtn" onClick={handleCSVFileImport}>
          <CiImport size={20} strokeWidth={1} />
          <span style={{ fontWeight: "400" }}>
            {isImporting ? "Importing..." : "Import"}
          </span>
        </button>
        <input
          type="file"
          id="attachment"
          style={{ display: "none" }}
          accept=".csv"
          onChange={(e) => handleInput(e)}
        />
      </div>
    </div>
  );
};

export default Toolbar;
