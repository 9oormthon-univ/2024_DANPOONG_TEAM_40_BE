const express = require('express');
const listController = require('../controllers/list-controller');

const router = express.Router();

// 리스트 조회
router.get('/', listController.getLists);

// 리스트 생성
router.post('/', listController.createList);

// 리스트에 장소 저장
router.post('/:listId/place', listController.savePlaceToList);

module.exports = router;
