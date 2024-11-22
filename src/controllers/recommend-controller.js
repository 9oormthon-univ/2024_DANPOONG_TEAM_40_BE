const { StatusCodes } = require('http-status-codes');
const recommendService = require('../services/recommend-service');

exports.getMonthlyRecommend = async (req, res) => {
  try {
    const { month } = req.body;
    if (!month) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: '날짜(월)가 확인되지 않습니다.' });
    }

    const recommendData = await recommendService.getMonthlyRcmdData(month);

    if (!recommendData) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `${month}월 추천장소가 없습니다.` });
    }

    const monthlyMessage = monthlyMessages[month] || {
      title: '추천 메시지 없음',
      message: '해당 월의 메시지가 존재하지 않습니다.',
    };
    res.status(StatusCodes.OK).json({
      message: '추천 장소 데이터 조회 성공',
      data: recommendData,
      monthlyMessage,
    });
  } catch (err) {
    console.error(err.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '추천 장소 데이터 삽입 중 에러 발생',
    });
  }
};
