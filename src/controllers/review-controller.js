const { StatusCodes } = require('http-status-codes');
const reviewService = require('../services/review-service');

/**
 * 새로운 리뷰를 등록합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} req.params - 요청 경로 파라미터 (id: 장소 ID)
 * @param {Object} req.body - 요청 바디 (wheelchairAccess, service, taste, reviewText 포함)
 * @param {Object} req.files - 업로드된 이미지 파일 목록
 * @param {Object} res - Express 응답 객체
 * @returns {Promise<void>} 성공 또는 에러 응답 반환
 * @throws {Error} 필수 데이터 누락, 서버 오류 발생 시 처리
 */
exports.postReview = async (req, res) => {
  try {
    const placeId = req.params.id;
    const userId = req.user?.id || 1;
    const { wheelchairAccess, service, taste, reviewText } = req.body;

    // 필수 데이터 확인
    if (
      !wheelchairAccess ||
      !service ||
      !taste ||
      !reviewText ||
      reviewText.length < 20
    ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: '리뷰 작성에 필요한 정보를 모두 입력해주세요.' });
    }

    if (!placeId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: '등록하려는 리뷰의 장소 id가 누락되었습니다.' });
    }

    if (!userId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: '회원만 리뷰를 작성할 수 있습니다.' });
    }

    const images = req.files.map((file) => file.path) || [];
    const reviewData = {
      userId,
      placeId,
      wheelchairAccess,
      service,
      taste,
      reviewText,
      images,
    };
    const review = await reviewService.createReview(reviewData);

    res.status(StatusCodes.CREATED).json({
      message: '리뷰 등록 성공',
      data: review,
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: '리뷰 등록 중 서버 에러 방생' });
  }
};

/**
 * 특정 장소의 리뷰를 조회합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} req.params - 요청 경로 파라미터 (id: 장소 ID)
 * @param {Object} res - Express 응답 객체
 * @returns {Promise<void>} 성공 또는 에러 응답 반환
 * @throws {Error} 필수 데이터 누락, 서버 오류 발생 시 처리
 */
exports.getReview = async (req, res) => {
  try {
    const placeId = req.params.id;
    if (!placeId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: '리뷰를 조회하고자 하는 장소의 정보가 제공되지 않았습니다.',
      });
    }

    const reviewData = await reviewService.selectReviews(placeId);

    if (!reviewData) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: '조회된 리뷰가 없습니다.' });
    }

    res.status(StatusCodes.OK).json({
      message: '리뷰 조회 성공',
      data: reviewData,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
