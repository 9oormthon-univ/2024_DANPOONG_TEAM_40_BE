const Review = require('../models/Review');

exports.createReview = async ({
  userId,
  placeId,
  wheelchairAccess,
  service,
  taste,
  reviewText,
  images,
}) => {
  try {
    // 리뷰 데이터 생성
    const review = new Review({
      userId,
      placeId,
      wheelchairAccess,
      service,
      taste,
      reviewText,
      images, // 업로드된 이미지 경로 저장
    });

    // DB 저장
    await review.save();
    return review;
  } catch (err) {
    console.error('리뷰 생성 실패:', err.message);
    throw new Error('리뷰 생성 중 문제가 발생했습니다.');
  }
};

exports.selectReviews = async (placeId) => {
  try {
    const reviews = await Review.find({ placeId: placeId });

    if (!reviews || reviews.length === 0) {
      return {
        averageRatings: null,
        ratingPercentages: null,
        reviews: [],
      };
    }

    const totalRatings = {
      taste: 0,
      service: 0,
      wheelchairAccess: 0,
    };

    reviews.forEach((review) => {
      totalRatings.taste += review.taste;
      totalRatings.service += review.service;
      totalRatings.wheelchairAccess += review.wheelchairAccess;
    });

    const taste = totalRatings.taste / reviews.length;
    const service = totalRatings.service / reviews.length;
    const wheelchairAccess = totalRatings.wheelchairAccess / reviews.length;
    // 평균 계산
    const averageRatings = ((taste + service + wheelchairAccess) / 3).toFixed(
      2
    );

    // 백분율 계산
    const ratingPercentages = {
      taste: (totalRatings.taste / (reviews.length * 5)) * 100 + '%',
      service: (totalRatings.service / (reviews.length * 5)) * 100 + '%',
      wheelchairAccess:
        (totalRatings.wheelchairAccess / (reviews.length * 5)) * 100 + '%',
    };

    return {
      message: '리뷰 조회 성공',
      averageRatings,
      ratingPercentages,
      reviews,
    };
  } catch (err) {
    console.error(err.message);
    throw new Error('리뷰 조회 중 에러 발생');
  }
};
