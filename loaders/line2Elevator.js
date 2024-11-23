const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * 엑셀 파일을 JSON으로 변환하고 저장
 */
function convertExcelToJson() {
  const excelFilePath = path.join(__dirname, './data/수도권2호선 엘레베이터.ㅌ');
  const jsonFilePath = path.join(__dirname, '../../data/elevatorData.json');

  try {
    console.log(`엑셀 파일 읽는 중: ${excelFilePath}`);
    const workbook = xlsx.readFile(excelFilePath);

    // 첫 번째 시트 데이터 가져오기
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // JSON 파일로 저장
    fs.writeFileSync(jsonFilePath, JSON.stringify(sheetData, null, 2), 'utf-8');
    console.log('JSON 변환 및 저장 완료:', jsonFilePath);
  } catch (error) {
    console.error('엑셀 변환 중 오류 발생:', error.message);
  }
}

// 실행
convertExcelToJson();