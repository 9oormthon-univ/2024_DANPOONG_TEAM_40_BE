const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review-controller');
const Upload = require('../utils/upload');

const upload = new Upload('uploads/reviews').getUploader();
// 리뷰 작성
router.post('/:id', upload.array('images', 5), reviewController.postReview);
// 리뷰 조회
router.get('/:id', reviewController.getReview);

module.exports = router;
