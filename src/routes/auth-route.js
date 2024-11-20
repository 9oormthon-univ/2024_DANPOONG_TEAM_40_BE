const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const Upload = require('../utils/upload');
const router = express.Router();

//Upload 인스턴스 생성 및 업로더 설정
const upload = new Upload().getUploader();

// 카카오 로그인 라우트
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: '/auth/signup',
    failureMessage: true,
  }),
  (req, res) => {
    console.log('Logged-in user:', req.user); // 로그 확인
    if (!req.user) {
      console.error('Authentication failed - req.user is undefined');
      return res.redirect('/auth/signup');
    }
    res.redirect('/'); // 로그인 성공 시 홈으로 리디렉션
  }
);

// 로그아웃 라우트
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return next(err);
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('Error destroying session:', sessionErr);
        return next(sessionErr);
      }
      res.redirect('/'); // 로그아웃 후 홈으로 리디렉션
    });
  });
});

// 회원가입 페이지
router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res) => {
  const { nickname, profileImage } = req.body;
  try {
    const user = new User({
      kakaoId: req.session.passport.user.id,
      displayName: nickname,
      profileImage: profileImage,
    });
    await user.save();
    console.log('New user registered:', user);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
});

// 프로필 설정 라우트
router.post('/set-profile', upload.single('profileImage'), async (req, res) => {
  const { nickname } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

  if (!req.user) {
    console.error('Error: req.user is undefined');
    return res.status(400).send('User is not authenticated');
  }

  try {
    const user = await User.findOneAndUpdate(
      { kakaoId: req.user.id }, // 카카오 ID로 사용자 찾기
      {
        displayName: nickname,
        profileImage: profileImage,
      },
      { new: true, upsert: true } // 없으면 새로 생성
    );

    console.log('User updated or created:', user);
    res.redirect('/auth/signup-complete');
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).send('Error creating user');
  }
});

// 회원가입 완료 페이지
router.get('/signup-complete', (req, res) => {
  res.render('signup-complete'); // signup-complete.ejs 페이지 렌더링
});

router.get('/guest', (req, res) => {
  //세션에 게스트 사용자 정보를 저장
  req.session.isGuest = true; // 게스트 세션 플래그 설정
  res.redirect('/'); // 게스트 접근 시 홈으로 리디렉션
});

module.exports = router;