const XLSX = require("xlsx");

function fetchRandomPuzzle() {
  const workbook = XLSX.readFile(
    "C:/Users/shafa/Desktop/BIG_FOLDER/Chess Pro Test - 3/public/lichess_puzzles.csv"
  );

  const sheetName = workbook.SheetNames[0]; // Assuming you want to read from the first sheet
  const worksheet = workbook.Sheets[sheetName];

  // Get the range of rows
  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  const numRows = range.e.r + 1; // Total number of rows in the sheet

  // Generate a random row number
  const randomRow = Math.floor(Math.random() * (numRows - 1)) + 2; // Random row between 2 and numRows (excluding header row)

  // Function to get cell values for a given row
  function getRowData(rowNum) {
    const rowData = {};
    for (let i = range.s.c; i <= range.e.c; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: i });
      const cellData = worksheet[cellAddress];
      const cellValue = cellData ? cellData.v : ""; // Get cell value or empty string if cell is empty
      const columnName = XLSX.utils.encode_col(i);
      rowData[columnName] = cellValue;
    }
    return rowData;
  }

  // Get cell values for the random row
  const randomRowData = getRowData(randomRow);
  return randomRowData;
}

module.exports = { fetchRandomPuzzle };
