const xlsx = require('xlsx');

// 엑셀 데이터를 읽어서 JSON으로 변환
const loadExcelFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
};

module.exports = { loadExcelFile };