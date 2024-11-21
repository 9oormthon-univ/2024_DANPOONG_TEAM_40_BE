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
