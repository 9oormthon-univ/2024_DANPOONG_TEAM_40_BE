const { StatusCodes } = require('http-status-codes');
const aroundService = require('../services/around-service');

exports.getNearbyFacilities = async (req, res) => {
  try {
    // radius 단위(km)
    const { type, lat, lon, radius = 1 } = req.query; // 기본 반경: 500m

    if (!type || !['elevator', 'lift'].includes(type)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: '올바른 type 값을 제공해야 합니다. (elevator 또는 lift)',
      });
    }

    if (!lat || !lon) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: '위도(lat)와 경도(lon)를 제공해야 합니다.',
      });
    }

    const nearbyFacilities = await aroundService.getNearbyFacilities(
      type,
      parseFloat(lat),
      parseFloat(lon),
      parseFloat(radius)
    );

    res.status(StatusCodes.OK).json({
      message: `${type} 근처 시설 조회 성공`,
      data: nearbyFacilities,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '근처 시설 검색 중 에러 발생',
    });
  }
};
