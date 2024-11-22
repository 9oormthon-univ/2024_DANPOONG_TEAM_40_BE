const { StatusCodes } = require('http-status-codes');
const listService = require('../services/list-service');

// 리스트 조회
exports.getLists = async (req, res) => {
  try {
    // const userId = req.user?.id; // 인증된 사용자 ID
    const userId = 1;
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: '사용자 인증이 필요합니다.',
      });
    }

    const lists = await listService.getLists(userId);
    res.status(StatusCodes.OK).json({
      message: '리스트 조회 성공',
      data: lists,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '리스트 조회 중 문제가 발생했습니다.',
    });
  }
};

// 리스트 생성
exports.createList = async (req, res) => {
  try {
    const { userId, name } = req.body;
    // const userId = req.user?.id;

    if (!userId || !name) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: '리스트 생성에 필요한 정보를 제공해주세요.',
      });
    }

    const newList = await listService.createList(userId, name);
    res.status(StatusCodes.CREATED).json({
      message: '리스트 생성 성공',
      data: newList,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '리스트 생성 중 문제가 발생했습니다.',
    });
  }
};

// 리스트에 장소 저장
exports.savePlaceToList = async (req, res) => {
  try {
    const { listId } = req.params; // 저장할 리스트 ID
    const { placeId, name, lat, lon, imageUrl, address } = req.body;

    if (!listId || !placeId || !name || !lat || !lon || !address) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: '장소 저장에 필요한 정보를 모두 제공해주세요.',
      });
    }

    // 근처 역명 조회
    const nearbyStation = await listService.getNearbyStation(lat, lon);

    // 장소 데이터 생성
    const placeData = {
      placeId,
      name,
      lat,
      lon,
      imageUrl,
      address,
      nearbyStation,
    };

    // 리스트에 장소 추가
    const updatedList = await listService.savePlaceToList(listId, placeData);

    res.status(StatusCodes.OK).json({
      message: '장소가 리스트에 성공적으로 저장되었습니다.',
      data: updatedList,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '리스트에 장소 저장 중 문제가 발생했습니다.',
    });
  }
};
