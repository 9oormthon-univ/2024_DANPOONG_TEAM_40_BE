const passport = require('./kakao-strategy'); // KakaoStrategy가 설정된 passport 인스턴스
const User = require('../models/User'); // User 모델 임포트

// 사용자 세션 직렬화 및 역직렬화 설정
passport.serializeUser((user, done) => {
  done(null, user.id); // 사용자 ID 저장
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;