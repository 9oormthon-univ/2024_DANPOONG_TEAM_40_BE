const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

const client = new textToSpeech.TextToSpeechClient();

/**
 * Text를 음성 파일로 변환합니다.
 * @param {string} text - 변환할 텍스트
 * @returns {Promise<string>} 생성된 음성 파일 경로
 */
exports.generateSpeech = async (text) => {
  try {
    const request = {
      input: { text },
      voice: { languageCode: 'ko-KR', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);

    const outputFilePath = `./outputs/audio_${Date.now()}.mp3`;
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputFilePath, response.audioContent, 'binary');

    return outputFilePath;
  } catch (error) {
    console.error('TTS 생성 오류:', error);
    throw new Error('TTS 생성에 실패했습니다.');
  }
};