const { StatusCodes } = require('http-status-codes');
const routeService = require('../services/route-service');
const ttsService = require('../services/tts-service');

/**
 * Tmap API를 이용해 대중교통 경로를 검색하고 TTS 음성을 생성합니다.
 * @param {Object} req - Express 요청 객체 (userId와 좌표 포함)
 * @param {Object} res - Express 응답 객체
 * @throws {Error} 경로 검색 또는 TTS 생성 중 오류 발생 시 처리
 */
exports.findTransitRoute = async (req, res) => {
  const { userId, startX, startY, endX, endY } = req.body;

  if (!userId || !startX || !startY || !endX || !endY) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'userId와 좌표가 필요합니다.',
    });
  }

  const coordinate = { startX, startY, endX, endY };
  try {
    // 1. 경로 데이터 가져오기
    const routeData = await routeService.fetchTransitRoute(coordinate);

    if (!routeData || routeData.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: '경로 데이터를 찾을 수 없습니다.' });
    }

    // 2. 경로 데이터 텍스트 생성
    const routeDescription = routeData[0].legs
      .map((leg, index) => {
        const start = `${leg.start.name}`;
        const end = `${leg.end.name}`;
        const mode = leg.mode === 'SUBWAY' ? '지하철' : '도보';
        return `${index + 1}번째 구간: ${start}에서 ${end}까지 ${mode}로 이동합니다.`;
      })
      .join(' ');

    // 3. TTS 음성 파일 생성
    const audioFilePath = await ttsService.generateAudio(routeDescription);

    // 4. 사용자 응답 반환
    return res.status(StatusCodes.OK).json({
      message: '경로 탐색 및 음성 파일 생성 완료!',
      route: routeData[0], // 첫 번째 경로 데이터 반환
      audioFilePath, // 음성 파일 경로 반환
    });
  } catch (err) {
    console.error(err.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '경로 탐색 및 음성 파일 생성 중 서버 오류',
    });
  }
};

/**
 * 경로 데이터를 가져와 TTS 음성 파일을 생성합니다.
 */
exports.navigateRoute = async (req, res) => {
  try {
    const { startX, startY, endX, endY } = req.body;

    if (!startX || !startY || !endX || !endY) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: '시작 및 종료 좌표가 필요합니다.',
      });
    }

    // Tmap API에서 경로 데이터 가져오기
    const coordinate = { startX, startY, endX, endY };
    const routeData = await routeService.fetchTransitRoute(coordinate);

    if (!routeData || routeData.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: '경로 데이터를 찾을 수 없습니다.',
      });
    }

    // 경로 설명 생성
    const routeDescription = routeService.createRouteDescription(routeData);

    // TTS 음성 파일 생성
    const audioFilePath = await ttsService.generateAudio(routeDescription);

    return res.status(StatusCodes.OK).json({
      message: 'Tmap에서 경로 데이터를 가져왔습니다.',
      route: routeData,
      audioFilePath, // 생성된 음성 파일 경로 반환
    });
  } catch (err) {
    console.error('TTS 생성 중 오류:', err.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '경로 데이터를 가져오거나 음성 파일 생성 중 오류 발생',
    });
  }
};