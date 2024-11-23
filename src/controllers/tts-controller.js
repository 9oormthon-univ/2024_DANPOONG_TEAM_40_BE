const ttsService = require('../services/tts-service');
const routeService = require('../services/route-service');
const { StatusCodes } = require('http-status-codes');
const { geocode } = require('../services/geocoding-service');

exports.getRouteAudio = async (req, res) => {
  try {
    const { startAddress, endAddress, selectedRouteIndex = 0 } = req.body;

    if (!startAddress || !endAddress) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: '출발지와 목적지 주소가 필요합니다.',
      });
    }

    // 1. 주소를 좌표로 변환
    const startCoords = await geocode(startAddress);
    const endCoords = await geocode(endAddress);

    const coordinate = {
      startX: startCoords.lon,
      startY: startCoords.lat,
      endX: endCoords.lon,
      endY: endCoords.lat,
    };

    // 2. 경로 데이터를 Tmap에서 가져오기
    const routeData = await routeService.fetchTransitRoute(coordinate);

    if (!routeData || routeData.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Tmap에서 경로 데이터를 가져올 수 없습니다.',
      });
    }

    // 3. 선택한 경로 설명 생성
    const selectedRoute = routeData[selectedRouteIndex];
    const routeDescription = selectedRoute.legs
      .map((leg, index) => {
        const start = index === 0 ? startAddress : leg.start.name || '출발지';
        const end = index === selectedRoute.legs.length - 1 ? endAddress : leg.end.name || '도착지';
        const mode = leg.mode === 'SUBWAY' ? '지하철' : leg.mode === 'BUS' ? '버스' : '도보';
        const distance = leg.distance || '알 수 없음';
        const time = leg.sectionTime || '알 수 없음';

        // 도보 구간
        if (mode === '도보') {
          const wheelchairAccessible = leg.description.some((step) =>
            step.description.includes('경사로') || step.description.includes('엘리베이터')
          );
          const accessibilityInfo = wheelchairAccessible
            ? '이동이 편리한 경로입니다.'
            : '경사로가 부족할 수 있으니 유의하세요.';
          return `${start}에서 ${end}까지 도보로 이동합니다. 약 ${distance} 이동하며, ${time}이 소요됩니다. ${accessibilityInfo}`;
        }

        // 지하철 구간
        if (mode === '지하철') {
          const stepsDescription = leg.steps
            ? leg.steps
                .map((step, stepIndex) => {
                  return `- ${step.description} (${step.distance || '알 수 없음'} 이동)`;
                })
                .join(' ')
            : '';
          return `${start}에서 ${end}까지 지하철로 이동합니다. 소요 시간은 약 ${time}입니다. ${stepsDescription}`;
        }

        // 버스 구간
        return `${start}에서 ${end}까지 ${mode}로 이동합니다. 소요 시간은 약 ${time}입니다.`;
      })
      .join(' ');

    // 4. 전체 안내 시작 부분과 마무리 추가
    const finalRouteDescription = `안녕하세요. ${startAddress}에서 출발하여 ${endAddress}까지의 안내입니다. ${routeDescription} 감사합니다.`;

    // 5. 음성 파일 생성
    const audioFilePath = await ttsService.generateAudio(finalRouteDescription);

    return res.status(StatusCodes.OK).json({
      message: '경로 데이터 기반 음성 파일 생성 완료!',
      routeId: selectedRoute.routeId,
      audioFilePath,
    });
  } catch (err) {
    console.error('TTS 생성 중 오류:', err.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'TTS 음성 파일 생성 중 오류 발생',
    });
  }
};