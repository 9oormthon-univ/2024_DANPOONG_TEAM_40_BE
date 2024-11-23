const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const passport = require('./src/passport');
const connect = require('./src/models');

// 라우터들
const authRouter = require('./src/routes/auth-route');
const indexRouter = require('./src/routes/index-route');
const routeRouter = require('./src/routes/route-route');
const placeRouter = require('./src/routes/place-route');
const reviewRouter = require('./src/routes/review-route');
const recommendRouter = require('./src/routes/recommend-route');
const aroundRouter = require('./src/routes/around-route');
const listRouter = require('./src/routes/list-route');

const app = express();

// 데이터베이스 연결
connect();

// 포트 설정
const PORT = process.env.PORT || 3000;
app.set('port', PORT);

// 보안 및 로깅 설정
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
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*', // 허용된 도메인 설정
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// 정적 파일 서빙
app.use('/static', express.static(path.join(__dirname, 'public')));

// JSON 및 URL 인코딩된 데이터 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 세션 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false, // 기본값 변경
    cookie: { secure: process.env.NODE_ENV === 'production' }, // 프로덕션 환경에서만 secure
  })
);

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// 뷰 엔진 설정
app.set('view engine', 'ejs');

// 라우터 설정 (구체적인 경로를 먼저 등록)
app.use('/auth', authRouter);
app.use('/places', placeRouter);
app.use('/route', routeRouter);
app.use('/review', reviewRouter);
app.use('/recommend', recommendRouter);
app.use('/around', aroundRouter);
app.use('/list', listRouter);
app.use('/', indexRouter);

// 디버깅용 세션 확인 엔드포인트 (개발 중에만 사용)
if (process.env.NODE_ENV !== 'production') {
  app.get('/session', (req, res) => {
    console.log('세션 데이터:', req.session);
    res.send(req.session);
  });
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
