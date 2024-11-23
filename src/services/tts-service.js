const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Google TTS 클라이언트 생성
const client = new textToSpeech.TextToSpeechClient();

// Ensure the outputs directory exists
const ensureOutputDirectory = () => {
  const outputDir = path.join(__dirname, '../outputs'); // 프로젝트 기준 outputs 디렉토리
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true }); // 폴더가 없으면 생성
    console.log(`Created directory: ${outputDir}`);
  }
  return outputDir;
};

/**
 * Text를 음성 파일로 변환합니다.
 * @param {string} text - 변환할 텍스트
 * @returns {Promise<string>} 생성된 음성 파일 경로
 */
exports.generateSpeech = async (text) => {
  try {
    // Ensure the outputs folder exists
    const outputDir = ensureOutputDirectory();

    const request = {
      input: { text },
      voice: { languageCode: 'ko-KR', ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    // Google TTS API 호출
    const [response] = await client.synthesizeSpeech(request);

    // 파일 경로 생성
    const outputFilePath = path.join(outputDir, `audio_${Date.now()}.mp3`);

    // 파일 저장
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputFilePath, response.audioContent, 'binary');

    console.log(`TTS 음성 파일 생성: ${outputFilePath}`);
    return outputFilePath;
  } catch (error) {
    console.error('TTS 생성 오류:', error);
    throw new Error('TTS 생성에 실패했습니다.');
  }
};