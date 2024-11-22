const { StatusCodes } = require('http-status-codes');
const placeService = require('../services/place-service');

/**
 * 키워드와 현재 위치를 기반으로 장소를 검색합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} req.query - 쿼리 파라미터 (keyword, page, count)
 * @param {Object} req.body - 요청 바디 (userLat, userLon)
 * @param {Object} res - Express 응답 객체
 * @throws {Error} 잘못된 요청 또는 서버 오류 발생 시 처리
 */
exports.searchPlace = async (req, res) => {
  const { keyword, page, count } = req.query;
  const { userLat, userLon } = req.body;

  if (!keyword) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: '키워드를 입력해야 합니다.' });
  }

  if (!userLat || !userLon) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '현재 위치가 파악되지 않습니다.',
    });
  }

  if (page <= 0 || count <= 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'page와 count는 양수여야 합니다.' });
  }

  try {
    const places = await placeService.searchPlace(
      userLat,
      userLon,
      keyword,
      page,
      count
    );
    return res.status(StatusCodes.OK).json({
      message: '장소 검색 성공',
      data: places,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '장소 검색 중 서버 오류 발생',
    });
  }
};

/**
 * 특정 장소의 ID를 기반으로 상세 정보를 조회하고, 검색 기록을 저장합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} req.params - 경로 파라미터 (pid)
 * @param {Object} req.user - 사용자 정보 객체 (userId 포함)
 * @param {Object} req.session - 비회원 세션 객체
 * @param {Object} res - Express 응답 객체
 * @throws {Error} 장소 상세 조회 실패 시 처리
 */
exports.searchSpecifiedPlace = async (req, res) => {
  try {
    const pid = req.params.pid;
    const userId = req.user.userId;
    if (!pid) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: '검색하고자 하는 장소의 id가 포함되지 않았습니다' });
    }
    const placeInfo = await placeService.getSpecifiedPlace(pid);

    const lat = parseFloat(placeInfo.lat);
    const lon = parseFloat(placeInfo.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: '유효하지 않은 좌표 값입니다.',
      });
    }

    if (req.user?.userId) {
      const searchLog = {
        userId: userId || null,
        searchType: 'place-detail',
        searchData: {
          placeId: pid,
          placeName: placeInfo.name,
          coordinates: {
            latitude: lat,
            longitude: lon,
          },
        },
        searchTime: new Date(),
      };

      await placeService.updateOrSaveSearchLog(searchLog);
      console.log('회원 검색 기록 저장 성공');
    } else {
      if (!req.session.recentSearch) {
        req.session.recentSearch = [];
      }

      const isDuplicate = req.session.recentSearch.some(
        (log) => log.placeId === pid
      );

      if (!isDuplicate) {
        req.session.recentSearch.push({
          placeId: pid,
          placeName: placeInfo.name,
          coordinates: { latitude: lat, longitude: lon },
          searchTime: new Date(),
        });
        if (req.session.recentSearch.length > 5) {
          req.session.recentSearch.shift();
        }
      } else {
        req.session.recentSearch = req.session.recentSearch.map((log) => {
          if (log.placeId === pid) {
            log.searchTime = new Date();
          }
          return log;
        });
      }
      console.log('비회원 검색 기록 저장 성공: ', req.session.recentSearch);
    }
    return res
      .status(StatusCodes.OK)
      .json({ message: '상세 정보 조회 성공', data: placeInfo });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: '장소 검색 중 에러 발생' });
  }
};
