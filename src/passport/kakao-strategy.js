const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const { v4: uuidv4 } = require('uuid');
const authService = require('../services/auth-service'); // 서비스 추가
const User = require('../models/User');
require('dotenv').config();

passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.Client_ID,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 기존 가입된 사용자인지 확인
        let user = await User.findOne({ kakaoId: profile.id });

        if (!user) {
          // 신규 사용자 생성 및 자동 회원가입 처리
          user = new User({
            userId: uuidv4(),
            kakaoId: profile.id,
            displayName: profile.displayName,
            profileImage:
              profile._json &&
              profile._json.properties &&
              profile._json.properties.profile_image,
          });
          await user.save(); // 새 사용자 저장
          console.log('New user registered:', user);
        } else {
          console.log('Existing user logged in:', user);
        }

        // 사용자를 로그인 처리
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

module.exports = passport;