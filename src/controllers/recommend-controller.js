const { StatusCodes } = require('http-status-codes');
const recommendService = require('../services/recommend-service');

// 월별 메시지 데이터
const monthlyMessages = {
  1: {
    icon: '🐍',
    title: '1월의 길',
    message: '새해엔 떡만둣국과 새 다이어리로 힘차게 출발해요! 🐍✨',
  },
  2: {
    icon: '🎀',
    title: '2월의 길',
    message: '따뜻한 실내에서 초콜릿보다 달콤한 데이트를 즐겨보세요! 💕',
  },
  3: {
    icon: '🌱',
    title: '3월의 길',
    message: '3월에는 봄바람 맞으며 나들이 떠나볼까요?',
  },
  4: {
    icon: '🌸',
    title: '4월의 길',
    message:
      '벚꽃이 활짝 피는 계절! 나들이 가방 챙기고, 벚꽃 명소로 떠나보세요! 📸✨',
  },
  5: {
    icon: '👨‍👩‍👧‍👦',
    title: '5월의 길',
    message: '5월에는 온 가족 모두가 행복한 하루를 만들어 보세요!',
  },
  6: {
    icon: '🍨',
    title: '6월의 길',
    message: '더위엔 빙수가 정답! 🍧 빙수 맛집을 방문해 보세요!',
  },
  7: {
    icon: '⛱️',
    title: '7월의 길',
    message: '7월에는 여름방학(휴가)을 재밌게 보내는 법을 알려드릴게요! 🎲📚',
  },
  8: {
    icon: '🌡️',
    title: '8월의 길',
    message: '너무 더운 8월, 시원한 실내로 피신해볼까요? ❄️',
  },
  9: {
    icon: '🌕',
    title: '9월의 길',
    message: '천고마비의 계절, 9월에는 `오늘 뭐 먹지?`가 가장 즐거운 고민!',
  },
  10: {
    icon: '🍁',
    title: '10월의 길',
    message: '짧은 가을을 놓치지 마세요! 🍂 지금이 바로 최적의 타이밍! 🚶‍♂️✨',
  },
  11: {
    icon: '🍴',
    title: '11월의 길',
    message: '가래떡데이? 알차게 보내야죠! 떡볶이 맛집 투어를 떠나보세요!',
  },
  12: {
    icon: '🎄',
    title: '12월의 길',
    message: '12월에는 소중한 사람과 따뜻한 장소를 방문해 보세요!',
  },
};

exports.getMonthlyRecommend = async (req, res) => {
  try {
    const { month } = req.params;
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
