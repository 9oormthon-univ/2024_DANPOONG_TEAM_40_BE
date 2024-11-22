const express = require('express');
const aroundController = require('../controllers/around-controller');

const router = express.Router();

// 새로운 주변 시설 조회 (근처 시설 검색 API 추가 가능)
router.get('/nearby', aroundController.getNearbyFacilities);
module.exports = router;
