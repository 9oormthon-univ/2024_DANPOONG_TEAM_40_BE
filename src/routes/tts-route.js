const express = require('express');
const router = express.Router();
const ttsController = require('../controllers/tts-controller');

// 대중교통 경로 탐색 및 TTS 생성 API
router.post('/audio', ttsController.getRouteAudio);

module.exports = router;