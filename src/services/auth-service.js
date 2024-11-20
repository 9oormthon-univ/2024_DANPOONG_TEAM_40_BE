const User = require('../models/User'); // 사용자 모델
const { v4: uuidv4 } = require('uuid');

exports.processKakaoProfile = async (profile, accessToken, refreshToken) => {
  // 기존에 사용자가 존재하는지 확인
  let user = await User.findOne({ kakaoId: profile.id });

  if (!user) {
    // 신규 사용자 생성
    user = new User({
      userId: uuidv4(),
      kakaoId: profile.id,
      displayName: profile.displayName,
      profileImage:
        profile._json &&
        profile._json.properties &&
        profile._json.properties.profile_image,
    });
    await user.save();
    console.log('New user created:', user);
  } else {
    // 기존 사용자 로그인
    console.log('Existing user logged in:', user);
  }

  return user;
};