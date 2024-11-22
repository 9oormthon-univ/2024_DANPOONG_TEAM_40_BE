const axios = require('axios');
const SearchLog = require('../models/SearchLog');

// 거리 계산 함수
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 거리 (km)
};

exports.searchPlace = async (
  userLat,
  userLon,
  keyword,
  page = 1,
  count = 5
) => {
  try {
    const response = await axios.get('https://apis.openapi.sk.com/tmap/pois', {
      headers: {
        appKey: process.env.TMAP_KEY,
      },
      params: {
        searchKeyword: keyword,
        page: page,
        count: count,
      },
    });

    const pois = response.data.searchPoiInfo.pois.poi || [];

    return pois.map((poi) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        poi.frontLat,
        poi.frontLon
      );
      return {
        id: poi.id,
        pkey: poi.pkey,
        name: poi.name,
        telNo: poi.telNo,
        upperBizName: poi.upperBizName,
        middleBizName: poi.middleBizName,
        lowerBizName: poi.lowerBizName,
        fullAddress: poi.upperAddrName + ' ' + poi.middleAddrName,
        lat: poi.frontLat,
        lon: poi.frontLon,
        distance: distance.toFixed(2) + 'km',
      };
    });
  } catch (err) {
    console.error('장소 검색 실패', err.message);
    throw err;
  }
};

exports.getSpecifiedPlace = async (pid) => {
  try {
    const response = await axios.get(
      `https://apis.openapi.sk.com/tmap/pois/${pid}`,
      {
        headers: {
          appKey: process.env.TMAP_KEY,
        },
      }
    );

    const poiInfo = response.data.poiDetailInfo || [];
    console.log(poiInfo);
    return {
      id: poiInfo.id,
      name: poiInfo.name,
      subName: poiInfo.bizCatName,
      desc: poiInfo.desc,
      address: poiInfo.address,
      point: poiInfo.point,
      useTime: poiInfo.useTime,
      lat: poiInfo.lat,
      lon: poiInfo.lon,
    };
  } catch (err) {
    console.error('장소 상세 검색 중 서버 오류', err);
    throw err;
  }
};

exports.updateOrSaveSearchLog = async (logData) => {
  try {
    if (!logData || !logData.userId) {
      throw new Error('logData에 userId가 포함되지 않았습니다.');
    }

    const existingLog = await SearchLog.findOne({
      userId: logData.userId,
      'searchData.placeId': logData.searchData.placeId,
    });

    if (existingLog) {
      existingLog.searchTime = new Date();
      await existingLog.save();
    } else {
      const searchLog = new SearchLog(logData);
      await searchLog.save();
      console.log('새 검색 기록 저장 성공');
    }
  } catch (err) {
    console.error(err);
    throw new Error('검색 기록 저장 중 에러 발생');
  }
};

exports.findSearchLog = async (userId, placeId) => {
  return await SearchLog.findOne({
    userId,
    'searchData.placeId': placeId,
  });
};
