require('dotenv').config(); // 환경 변수 로드

const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const path = require('path');

// Google TTS 클라이언트 초기화
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // 환경 변수에서 경로 가져오기
});

/**
 * 텍스트를 음성 파일로 변환합니다.
 * @param {string} text - 변환할 텍스트
 * @returns {Promise<string>} 생성된 음성 파일 경로
 */
exports.generateAudio = async (text) => {
  try {
    const request = {
      input: { text },
      voice: { languageCode: 'ko-KR', ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    const filePath = path.join(
      __dirname,
      '../uploads/audio',
      `audio_${Date.now()}.mp3`
    );
    await util.promisify(fs.writeFile)(
      filePath,
      response.audioContent,
      'binary'
    );

    return filePath;
  } catch (err) {
    console.error('TTS 생성 실패:', err.message);
    throw new Error('TTS 음성 생성 실패');
  }
};
