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
    failureRedirect: '/',
    failureMessage: true,
  }),
  async (req, res) => {
    try {
      const user = await User.findOne({ kakaoId: req.user.kakaoId });

      if (user) {
        if (user.isRegistered) {
          console.log('Existing registered user logged in:', user);
          return res.redirect('/'); // 홈 화면으로 리디렉션
        } else {
          console.log('New user needs to register:', user);
          return res.redirect('/auth/signup'); // 회원가입 페이지로 리디렉션
        }
      }

      console.error('User not found but authentication succeeded.');
      res.redirect('/');
    } catch (error) {
      console.error('Error during Kakao callback:', error);
      res.redirect('/');
    }
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
  if (req.isAuthenticated() && req.user.isRegistered) {
    return res.redirect('/'); // 회원가입 완료된 사용자 홈으로 리디렉션
  }
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
      { kakaoId: req.user.kakaoId }, // 카카오 ID로 사용자 찾기
      {
        displayName: nickname,
        profileImage: profileImage,
        isRegistered: true, // 회원가입 완료 상태로 업데이트
      },
      { new: true }
    );

    console.log('User updated and registered:', user);
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



// 프로필 페이지
router.get('/profile', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.redirect('/auth/kakao'); // 인증되지 않은 경우 로그인 페이지로 리디렉션
  }

  try {
    // 데이터베이스에서 사용자 정보 가져오기
    const user = await User.findOne({ kakaoId: req.user.kakaoId });

    if (!user) {
      console.error('User not found');
      return res.status(404).send('User not found');
    }

    // 프로필 페이지 렌더링
    res.render('profile', {
      user, // 사용자 데이터 전달
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Internal Server Error');
  }
});



router.post('/update-profile-picture', upload.single('profileImage'), async (req, res) => {
  if (!req.user) {
    return res.status(401).send('User not authenticated');
  }

  try {
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    if (!profileImage) {
      return res.status(400).send('No file uploaded');
    }

    // 데이터베이스에서 사용자 프로필 사진 업데이트
    await User.findOneAndUpdate(
      { kakaoId: req.user.kakaoId },
      { profileImage },
      { new: true }
    );

    console.log('Profile picture updated:', profileImage);
    res.redirect('/auth/profile'); // 프로필 페이지로 리디렉션
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).send('Error updating profile picture');
  }
});


router.get('/edit-nickname', (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/kakao');
  }

  res.render('edit-nickname', {
    nickname: req.user.displayName,
  });
});

router.get('/edit-nickname', (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/kakao');
  }

  res.render('edit-nickname', {
    nickname: req.user.displayName, // 현재 닉네임 전달
  });
});

router.post('/edit-nickname', async (req, res) => {
  const { nickname } = req.body;

  if (!req.user) {
    return res.status(401).send('User not authenticated');
  }

  try {
    // 닉네임 업데이트
    await User.findOneAndUpdate(
      { kakaoId: req.user.kakaoId },
      { displayName: nickname },
      { new: true }
    );

    console.log('Nickname updated:', nickname);
    res.redirect('/profile'); // 수정 후 프로필 페이지로 리디렉션
  } catch (error) {
    console.error('Error updating nickname:', error);
    res.status(500).send('Error updating nickname');
  }
});


router.get('/guest', (req, res) => {
  //세션에 게스트 사용자 정보를 저장
  req.session.isGuest = true; // 게스트 세션 플래그 설정
  res.redirect('/'); // 게스트 접근 시 홈으로 리디렉션
});

module.exports = router;