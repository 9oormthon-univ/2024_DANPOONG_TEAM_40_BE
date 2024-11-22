const { StatusCodes } = require('http-status-codes');
const placeService = require('../services/place-service');

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
