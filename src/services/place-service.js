const axios = require('axios');
const SearchLog = require('../models/SearchLog');

/**
 * 두 지점의 위도와 경도를 기반으로 거리를 계산합니다.
 * @param {number} lat1 - 첫 번째 지점의 위도
 * @param {number} lon1 - 첫 번째 지점의 경도
 * @param {number} lat2 - 두 번째 지점의 위도
 * @param {number} lon2 - 두 번째 지점의 경도
 * @returns {number} 계산된 거리 (단위: km)
 */
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

/**
 * Tmap API를 이용하여 키워드 기반의 장소 정보를 검색합니다.
 * @param {number} userLat - 사용자의 위도
 * @param {number} userLon - 사용자의 경도
 * @param {string} keyword - 검색 키워드
 * @param {number} [page=1] - 페이지 번호
 * @param {number} [count=5] - 페이지당 결과 개수
 * @returns {Promise<Object[]>} 검색된 장소 정보 배열
 * @throws {Error} Tmap API 호출 실패 시 처리
 */
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

/**
 * Tmap API를 이용하여 특정 장소의 상세 정보를 조회합니다.
 * @param {string} pid - 장소 ID
 * @returns {Promise<Object>} 장소 상세 정보 객체
 * @throws {Error} Tmap API 호출 실패 시 처리
 */
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

/**
 * 사용자 검색 기록을 저장하거나 업데이트합니다.
 * @param {Object} logData - 저장할 검색 기록 데이터
 * @param {string} logData.userId - 사용자 ID
 * @param {Object} logData.searchData - 검색 데이터 (placeId, placeName, coordinates 등)
 * @param {Date} logData.searchTime - 검색 시간
 * @throws {Error} 검색 기록 저장 실패 시 처리
 */
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

/**
 * 사용자 ID와 장소 ID를 기준으로 검색 기록을 조회합니다.
 * @param {string} userId - 사용자 ID
 * @param {string} placeId - 장소 ID
 * @returns {Promise<Object|null>} 검색 기록 객체 또는 null
 */
exports.findSearchLog = async (userId, placeId) => {
  return await SearchLog.findOne({
    userId,
    'searchData.placeId': placeId,
  });
};

/**
 * 카카오 API를 사용해 키워드로 장소 관련 정보를 검색합니다.
 * @param {string} keyword - 검색 키워드
 * @returns {Promise<Object[]>} 검색된 결과 배열 (web, image, vclip 등 타입별 데이터 포함)
 * @throws {Error} API 요청 실패 또는 처리 중 오류 발생 시 처리
 */
exports.searchPlaceInfo = async (keyword) => {
  try {
    // 공통 API 요청 설정
    const config = {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`,
      },
    };

    // 병렬 호출 설정 (각각의 요청에 size: 5 추가)
    const requests = [
      {
        type: 'web',
        url: 'https://dapi.kakao.com/v2/search/web',
        params: { query: keyword, size: 5 },
      },
      {
        type: 'image',
        url: 'https://dapi.kakao.com/v2/search/image',
        params: { query: keyword, size: 5 },
      },
      {
        type: 'vclip',
        url: 'https://dapi.kakao.com/v2/search/vclip',
        params: { query: keyword, size: 5 },
      },
    ];

    // Promise.all을 사용해 병렬 요청
    const responses = await Promise.all(
      requests.map((req) =>
        axios
          .get(req.url, { ...config, params: req.params })
          .then((response) => ({
            type: req.type, // 요청 타입 (web, image, vclip 등)
            data: response.data.documents || [], // API 응답 데이터
          }))
          .catch((error) => ({
            type: req.type,
            error: error.message, // 에러 메시지 포함
          }))
      )
    );

    // 결과 반환
    return responses;
  } catch (err) {
    console.error('검색 API 요청 중 에러: ', err.message);
    throw new Error('검색 API 요청 중 에러 발생');
  }
};
