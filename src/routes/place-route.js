const express = require('express');
const router = express.Router();
const placeController = require('../controllers/place-controller');

// 장소 통합 검색
router.get('/search', placeController.searchPlace);

// 개별 장소 검색
router.get('/search/:pid', placeController.searchSpecifiedPlace);

module.exports = router;
