const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommend-controller');

router.get('/:month', recommendController.getMonthlyRecommend);

module.exports = router;
