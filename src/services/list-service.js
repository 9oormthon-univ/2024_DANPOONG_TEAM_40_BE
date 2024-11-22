const List = require('../models/List');
const axios = require('axios');

// 리스트 조회
exports.getLists = async (userId) => {
  try {
    const lists = await List.find({ userId }); // 해당 사용자 ID의 리스트만 조회
    return lists;
  } catch (err) {
    console.error('리스트 조회 실패:', err.message);
    throw new Error('리스트 조회 중 문제가 발생했습니다.');
  }
};

// 리스트 생성
exports.createList = async (userId, name) => {
  try {
    const newList = new List({ userId, name, places: [] });
    await newList.save();
    return newList;
  } catch (err) {
    console.error('리스트 생성 실패:', err.message);
    throw new Error('리스트 생성 중 문제가 발생했습니다.');
  }
};

// 리스트에 장소 저장
exports.savePlaceToList = async (listId, placeData) => {
  try {
    const list = await List.findById(listId);

    if (!list) {
      throw new Error('리스트를 찾을 수 없습니다.');
    }

    // 중복 체크: 이미 저장된 장소인지 확인
    if (list.places.some((place) => place.placeId === placeData.placeId)) {
      throw new Error('해당 장소는 이미 리스트에 저장되어 있습니다.');
    }

    list.places.push(placeData);
    await list.save();

    return list;
  } catch (err) {
    console.error('장소 저장 실패:', err.message);
    throw new Error('리스트에 장소 저장 중 문제가 발생했습니다.');
  }
};

// Tmap API를 통해 근처 역명 조회
exports.getNearbyStation = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      'https://apis.openapi.sk.com/tmap/pois/search/around',
      {
        headers: { appKey: process.env.TMAP_KEY },
        params: {
          version: 1,
          categories: '지하철역',
          centerLat: latitude,
          centerLon: longitude,
          radius: 5, // 반경 500m
          count: 1, // 가장 가까운 역 1개 조회
        },
      }
    );

    console.log(response);

    const station = response.data.searchPoiInfo.pois.poi[0];
    return station?.name || '알 수 없음';
  } catch (err) {
    console.error('근처 역명 조회 실패:', err.message);
    return '알 수 없음';
  }
};
