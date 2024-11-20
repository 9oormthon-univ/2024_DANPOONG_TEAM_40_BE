const passport = require('./kakao-strategy'); // KakaoStrategy가 설정된 passport 인스턴스
const User = require('../models/User'); // User 모델 임포트

passport.serializeUser((user, done) => {
  done(null, user.userId); // 사용자 ID만 세션에 저장
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await User.findOne({ userId });
    done(null, user); // 세션에서 ID로 사용자 조회 후 req.user에 설정
  } catch (error) {
    done(error);
  }
});

module.exports = passport;