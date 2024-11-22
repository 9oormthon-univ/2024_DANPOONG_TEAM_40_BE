const passport = require('passport');

// 카카오 로그인
exports.kakaoLogin = passport.authenticate('kakao');

// 카카오 로그인 콜백
exports.kakaoCallback = (req, res, next) => {
  passport.authenticate('kakao', {
    failureRedirect: '/',
    successRedirect: '/',
  })(req, res, next);
};