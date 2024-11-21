const { StatusCodes } = require('http-status-codes');
const routeService = require('../services/route-service');

exports.findTransitRoute = async (req, res) => {
  const { userId, startX, startY, endX, endY } = req.body;

  if (!userId || !startX || !startY || !endX || !endY) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'userId 또는 좌표가 필요합니다' });
  }

  const coordinate = { startX, startY, endX, endY };
  try {
    // tmap api 호출
    const routeData = await routeService.fetchTransitRoute(coordinate);

    await routeService.saveRoutes(userId, routeData);

    res.status(StatusCodes.OK).json({
      message: '경로 탐색 성공',
      routes: routeData,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '경로 탐색 중 서버 오류',
    });
  }
};

exports.navigateRoute = async (req, res) => {
  try {
    const { userId, routeId } = req.body;
    if (!userId || !routeId) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'userId와 routeId가 누락되었습니다.' });
    }
    const navigateData = await routeService.getRouteById(userId, routeId);
    if (!navigateData) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: '해당 경로 데이터를 찾을 수 없습니다.' });
    }

    const processedRoute = [];
    for (let i = 0; i < navigateData.routeDetails.legs.length; i++) {
      const currentLeg = navigateData.routeDetails.legs[i];
      const nextLeg = navigateData.routeDetails.legs[i + 1];

      // 1. `subway -> walk -> subway` 환승 정보 추가
      if (
        currentLeg.mode === 'SUBWAY' &&
        nextLeg?.mode === 'WALK' &&
        navigateData.routeDetails.legs[i + 2]?.mode === 'SUBWAY'
      ) {
        const transferInfo = await routeService.fetchStationDetails(
          currentLeg.end.name,
          currentLeg.type,
          navigateData.routeDetails.legs[i + 2].end.name,
          navigateData.routeDetails.legs[i + 2].type
        );

        currentLeg.transferInfo = transferInfo?.body || [];
      }

      // 2. `subway` 시작이나 종료 시 역사 내부 정보 추가
      if (currentLeg.mode === 'SUBWAY') {
        const internalInfo = await routeService.fetchStationInternalDetails(
          currentLeg.start.name,
          currentLeg.type
        );
        currentLeg.internalInfo = internalInfo?.body || [];
      }

      processedRoute.push(currentLeg);
    }
    return res
      .status(StatusCodes.OK)
      .json({ message: '경로 안내 시작!', data: navigateData });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: '경로 안내 준비 중 에러 발생' });
  }
};
