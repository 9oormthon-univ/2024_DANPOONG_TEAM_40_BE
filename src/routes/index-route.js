const express = require('express');
const router = express.Router();

// 메인 페이지
router.get('/', (req, res) => {
  // res.render('index', { user: req.isAuthenticated() ? req.user : null });
  console.log('로그인 사용자 정보:', req.user);
  res.send(req.user ? '로그인 성공' : '로그인 필요');
});

module.exports = router;