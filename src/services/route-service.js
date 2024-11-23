const axios = require('axios');
const mongoose = require('mongoose');
const TransitRoute = require('../models/TransitRoute');
const Station = require('../models/Station');

/**
 * 역 이름과 노선 코드로 역 정보를 조회합니다.
 * @param {string} stationName - 역 이름
 * @param {string} lineCode - 노선 코드
 * @returns {Promise<Object>} 역 정보 객체 (lineCode, stationCode, railOperatorCode)
 * @throws {Error} 역 조회 실패 시 오류
 */
exports.findStationByName = async (stationName, lineCode) => {
  try {
    const station = await Station.findOne({
      stationName,
      lineCode: String(lineCode),
    });
    if (!station) {
      throw new Error(`역명을 찾을 수 없습니다: ${stationName}`);
    }
    return {
      lnCd: station.lineCode,
      stinCd: station.stationCode,
      railOprIsttCd: station.railOperatorCode,
    };
  } catch (err) {
    console.error('역 조회 실패: ', err.message);
    throw new Error('역 정보를 가져오는 중 문제가 발생했습니다.');
  }
};

/**
 * 특정 역의 내부 정보를 제공합니다.
 * @param {string} startStationName - 시작 역 이름
 * @param {string} startStatinLineCode - 시작 노선 코드
 * @returns {Promise<Object[]>} 내부 정보 배열
 * @throws {Error} 역 내부 정보 조회 실패 시 오류
 */
exports.fetchStationInternalDetails = async (
  startStationName,
  startStatinLineCode
) => {
  try {
    const startStation = await exports.findStationByName(
      startStationName,
      startStatinLineCode
    );

    const response = await axios.get(
      'https://openapi.kric.go.kr/openapi/handicapped/stationMovement',
      {
        params: {
          serviceKey: process.env.KRIC_API_KEY,
          format: 'json',
          lnCd: startStation.lnCd,
          railOprIsttCd: startStation.railOprIsttCd,
          stinCd: startStation.stinCd,
        },
      }
    );
    return response.data || [];
  } catch (err) {
    console.error('역 내부 경로 가져오기 실패: ', err.message);
  }
};

/**
 * 환승 경로 정보를 가져옵니다.
 * @param {string} startStationName - 시작 역 이름
 * @param {string} startLineCode - 시작 노선 코드
 * @param {string} endStationName - 종료 역 이름
 * @param {string} endLineCode - 종료 노선 코드
 * @returns {Promise<Object[]>} 환승 경로 정보 배열
 * @throws {Error} 환승 경로 조회 실패 시 오류
 */
exports.fetchStationDetails = async (
  startStationName,
  startLineCode,
  endStationName,
  endLineCode
) => {
  try {
    const startStation = await exports.findStationByName(
      startStationName,
      startLineCode
    );
    const endStation = await exports.findStationByName(
      endStationName,
      endLineCode
    );
    console.log(
      startStationName,
      startLineCode,
      endStationName,
      endLineCode,
      startStation.railOprIsttCd,
      startStation.stinCd
    );

    const response = await axios.get(
      'https://openapi.kric.go.kr/openapi/handicapped/transferMovement',
      {
        params: {
          serviceKey: process.env.KRIC_API_KEY,
          format: 'json',
          railOprIsttCd: startStation.railOprIsttCd,
          chthTgtLn: endLineCode,
          lnCd: startLineCode,
          stinCd: startStation.stinCd,
        },
      }
    );

    return response.data || [];
  } catch (err) {
    console.error('환승 경로 가져오기 실패: ', err.message);
    throw new Error('환승 경로 조회 실패');
  }
};

/**
 * Tmap API를 이용하여 대중교통 경로를 가져옵니다.
 * @param {Object} coordinate - 출발지 및 목적지 좌표
 * @param {number} coordinate.startX - 출발지 경도
 * @param {number} coordinate.startY - 출발지 위도
 * @param {number} coordinate.endX - 목적지 경도
 * @param {number} coordinate.endY - 목적지 위도
 * @returns {Promise<Object[]>} 경로 데이터 배열
 * @throws {Error} 경로 fetch 실패 시 오류
 */
exports.fetchTransitRoute = async (coordinate) => {
  try {
    const response = await axios.post(
      'https://apis.openapi.sk.com/transit/routes',
      {
        startX: coordinate.startX,
        startY: coordinate.startY,
        endX: coordinate.endX,
        endY: coordinate.endY,
        count: 3,
      },
      {
        headers: {
          appKey: process.env.TMAP_KEY,
        },
      }
    );

    const routeData = response.data.metaData.plan.itineraries;

    // 경로 데이터 가공
    const processedRoutes = routeData.map((itinerary) => ({
      routeId: new mongoose.Types.ObjectId(),
      type: itinerary.type,
      route: itinerary.route,
      totalTime:
        itinerary.totalTime >= 60
          ? `${Math.floor(itinerary.totalTime / 60)}분 ${
              itinerary.totalTime % 60
            }초`
          : `${itinerary.totalTime}초`,
      totalDistance:
        itinerary.totalDistance > 1000
          ? `${(itinerary.totalDistance / 1000).toFixed(2)}km`
          : `${itinerary.totalDistance}m`,
      totalFare: `${itinerary.fare.regular.totalFare}원`,
      totalWalkTime:
        itinerary.totalWalkTime >= 60
          ? `${Math.floor(itinerary.totalWalkTime / 60)}분 ${
              itinerary.totalWalkTime % 60
            }초`
          : `${itinerary.totalWalkTime}초`,
      totalWalkDistance:
        itinerary.totalWalkDistance > 1000
          ? `${(itinerary.totalWalkDistance / 1000).toFixed(2)}km`
          : `${itinerary.totalWalkDistance}m`,
      transferCount: itinerary.transferCount,
      legs: itinerary.legs.map((leg) => ({
        mode: leg.mode,
        route: leg.route,
        type: leg.type,
        sectionTime:
          leg.sectionTime >= 60
            ? `${Math.floor(leg.sectionTime / 60)}분 ${leg.sectionTime % 60}초`
            : `${leg.sectionTime}초`,
        distance:
          leg.distance > 1000
            ? `${(leg.distance / 1000).toFixed(2)}km`
            : `${leg.distance}m`,
        start: {
          name: leg.start.name,
          lat: leg.start.lat,
          lon: leg.start.lon,
        },
        end: {
          name: leg.end.name,
          lat: leg.end.lat,
          lon: leg.end.lon,
        },
        description: leg.steps?.map((step) => ({
          streetName: step.streetName || '',
          distance:
            step.distance > 1000
              ? `${(step.distance / 1000).toFixed(2)}km`
              : `${step.distance}m`,
          description: step.description,
        })),
      })),
    }));

    return processedRoutes;
  } catch (err) {
    console.error(err.message);
    throw new Error('경로 fetch 실패');
  }
};

/**
 * 사용자 ID와 경로 데이터를 저장합니다.
 * @param {string} userId - 사용자 ID
 * @param {Object[]} routes - 저장할 경로 데이터 배열
 * @throws {Error} 경로 저장 실패 시 오류
 */

exports.saveRoutes = async (userId, routes) => {
  try {
    const routeDocs = routes.map((route) => ({
      userId,
      routeId: route.routeId,
      routeDetails: route,
    }));

    await TransitRoute.insertMany(routeDocs);
  } catch (err) {
    console.error(err);
    throw new Error('경로 저장 실패');
  }
};

/**
 * 사용자 ID와 경로 ID로 특정 경로 데이터를 조회합니다.
 * @param {string} userId - 사용자 ID
 * @param {string} routeId - 조회할 경로 ID
 * @returns {Promise<Object|null>} 경로 데이터 객체 (없을 경우 null)
 * @throws {Error} 경로 조회 실패 시 오류
 */

exports.getRouteById = async (userId, routeId) => {
  try {
    const route = await TransitRoute.findOne({
      userId,
      routeId,
    });

    return route ? route.toObject() : null;
  } catch (err) {
    console.error(err);
    throw new Error('Route 데이터 조회 실패');
  }
};
