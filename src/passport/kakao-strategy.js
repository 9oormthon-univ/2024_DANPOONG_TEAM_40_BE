const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const { v4: uuidv4 } = require('uuid'); // 유니크한 userId 생성
const User = require('../models/User'); // User 모델
require('dotenv').config();

passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.Client_ID,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 데이터베이스에서 사용자 검색
        let user = await User.findOne({ kakaoId: profile.id });

        if (!user) {
          // 신규 사용자 생성
          user = new User({
            userId: uuidv4(),
            kakaoId: profile.id,
            displayName: profile.displayName,
            profileImage: profile._json?.properties?.profile_image || null,
          });
          await user.save();
          console.log('New user registered:', user);
        } else {
          console.log('Existing user logged in:', user);
        }

        // 사용자 세션 저장
        return done(null, user);
      } catch (error) {
        console.error('Error during Kakao login:', error);
        return done(error);
      }
    }
  )
);

module.exports = passport;