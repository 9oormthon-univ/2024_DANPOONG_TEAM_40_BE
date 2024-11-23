const express = require('express');
const router = express.Router();

// 메인 페이지
router.get('/', (req, res) => {
  console.log('Session user:', req.user);
  res.render('index', { user: req.isAuthenticated() ? req.user : null });
});
module.exports = router;