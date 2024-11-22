const express = require('express');
const router = express.Router();
const ttsController = require('../controllers/tts-controller');

// 경로 안내 음성 파일 생성 API
router.post('/audio', ttsController.getRouteAudio);

module.exports = router;