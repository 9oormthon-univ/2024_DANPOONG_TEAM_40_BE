const express = require('express');
const passport = require('./src/passport');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
require('dotenv').config();
const authRouter = require('./src/routes/auth-route');
const connect = require('./src/models');
const app = express();

// 데이터베이스 연결
connect();

// 포트 설정
app.set('port', process.env.PORT || 3000);

// 보안 설정 및 로깅
if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
  app.use(morgan('combined'));
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    })
  );
} else {
  app.use(morgan('dev'));
}

// CORS 설정
app.use(cors());

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'public')));

// JSON 및 URL 인코딩된 데이터 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 중복 제거 및 `extended: true` 유지

// 세션 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret-key', // 오타 수정
    resave: false,
    saveUninitialized: true,
  })
);

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// 뷰 엔진 설정
app.set('view engine', 'ejs');

// 라우터 설정
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/', authRouter);
app.use('/places', placeRouter);
app.use('/route', routeRouter);
app.get('/session', (req, res) => {
  console.log('세션 데이터:', req.session);
  res.send(req.session);
});



// 서버 시작
app.listen(app.get('port'), () => {
  console.log(`Server started on http://localhost:${app.get('port')}`);
});