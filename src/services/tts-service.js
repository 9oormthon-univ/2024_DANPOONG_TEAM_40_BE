const fs = require('fs');
const util = require('util');
const textToSpeech = require('@google-cloud/text-to-speech');

// Google TTS 클라이언트 초기화
const client = new textToSpeech.TextToSpeechClient();

/**
 * Google TTS를 사용해 텍스트를 음성 파일로 변환.
 * @param {string} text - 변환할 텍스트
 * @returns {Promise<string>} 생성된 음성 파일 경로
 */
exports.generateAudio = async (text) => {
  try {
    const request = {
      input: { text },
      voice: { languageCode: 'ko-KR', ssmlGender: 'FEMALE' }, // 한국어, 여성 목소리
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);

    const filePath = `./uploads/route_audio_${Date.now()}.mp3`;
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(filePath, response.audioContent, 'binary');
    return filePath;
  } catch (err) {
    console.error('TTS 음성 생성 실패:', err.message);
    throw new Error('TTS 음성 생성 실패');
  }
};
