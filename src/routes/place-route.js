const express = require('express');
const router = express.Router();
const placeController = require('../controllers/place-controller');

// 개별 상세 정보 검색
router.get('/info', placeController.getPlaceInfo);

// 장소 통합 검색
router.get('/search', placeController.searchPlace);

// 개별 징소 검색
router.get('/search/:pid', placeController.searchSpecifiedPlace);

module.exports = router;
