const LiftNode = require('../models/Lift');
const ElevatorNode = require('../models/Elevator');

exports.getNearbyFacilities = async (type, latitude, longitude, radius) => {
  try {
    let nearbyFacilities;

    if (type === 'elevator') {
      nearbyFacilities = await ElevatorNode.find({
        node_wkt: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], radius / 6378.1], // 반경 설정
          },
        },
      });
    } else if (type === 'lift') {
      nearbyFacilities = await LiftNode.find({
        node_wkt: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], radius / 6378.1], // 반경 설정
          },
        },
      });
    } else {
      throw new Error(
        '올바르지 않은 시설 타입입니다. (elevator 또는 lift만 허용)'
      );
    }

    return nearbyFacilities || [];
  } catch (err) {
    console.error('근처 시설 정보 조회 실패:', err.message);
    throw new Error('근처 시설 조회 중 문제가 발생했습니다.');
  }
};
