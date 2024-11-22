const express = require('express');
const router = express.Router();
const routeController = require('../controllers/route-controller');


// 대중교통 길찾기 api
router.post('/transit', routeController.findTransitRoute);

// 경로 안내 api
router.post('/detail', routeController.navigateRoute);

module.exports = router;
