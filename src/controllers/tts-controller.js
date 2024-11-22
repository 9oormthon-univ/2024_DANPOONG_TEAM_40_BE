const ttsService = require('../services/tts-service');
const routeService = require('../services/route-service');
const { StatusCodes } = require('http-status-codes');

/**
 * 경로 안내를 음성으로 변환하여 제공.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.getRouteAudio = async (req, res) => {
  try {
    const { userId, routeId } = req.body;

    if (!userId || !routeId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'userId와 routeId가 필요합니다.' });
    }

    const navigateData = await routeService.getRouteById(userId, routeId);
    if (!navigateData) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: '해당 경로 데이터를 찾을 수 없습니다.' });
    }

    // 경로 설명 텍스트 생성
    const routeDescription = navigateData.routeDetails.legs
      .map((leg, index) => {
        const start = `${leg.start.name}`;
        const end = `${leg.end.name}`;
        const mode = leg.mode === 'SUBWAY' ? '지하철' : '도보';
        return `${index + 1}번째 구간: ${start}에서 ${end}까지 ${mode}로 이동합니다.`;
      })
      .join(' ');

    // TTS 음성 파일 생성
    const audioFilePath = await ttsService.generateAudio(routeDescription);

    return res.status(StatusCodes.OK).json({
      message: '음성 파일 생성 완료!',
      audioFilePath, // 생성된 파일 경로 반환
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: '음성 파일 생성 중 오류 발생' });
  }
};