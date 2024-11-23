const express = require('express');
const router = express.Router();
const routeController = require('../controllers/route-controller');

// 디버깅 로그 추가
console.log('컨트롤러 확인:', routeController);

// 대중교통 경로 탐색 및 TTS 생성 API
router.post('/transit', routeController.findTransitRoute);

// 경로 안내 API
router.post('/detail', routeController.navigateRoute2);

module.exports = router;
