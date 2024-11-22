const Recommend = require('../models/Recommend');

exports.getMonthlyRcmdData = async (month) => {
  try {
    const monthlyRcmdData = await Recommend.find({ month: month });

    return monthlyRcmdData.map((data) => ({
      id: data.id,
      name: data.name,
      imageUrl: data.imageUrl,
      month: data.month,
    }));
  } catch (err) {
    console.error('예시 데이터 삽입 실패:', err.message);
    throw new Error('데이터 삽입 중 문제가 발생했습니다.');
  }
};
