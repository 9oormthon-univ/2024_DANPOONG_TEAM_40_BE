const express = require('express');
const passport = require('./src/passport');
const indexRouter = require('./src/routes/index-route');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
require('dotenv').config();
const authRouter = require('./src/routes/auth-route');
const routeRouter = require('./src/routes/route-route');
const placeRouter = require('./src/routes/place-route');
const reviewRouter = require('./src/routes/review-route');
const connect = require('./src/models');
const { healthRoute } = require('./src/routes/health-route');
const ttsRoute = require('./src/routes/tts-route');
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
app.use('/review', reviewRouter);
app.get('/session', (req, res) => {
  console.log('세션 데이터:', req.session);
  res.send(req.session);
});

app.use('/health', healthRoute);

// 기본 상태 코드 및 응답 메시지
const HTTP_STATUS = {
  SUCCESS: 200,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

app.get('/', (req, res) => {
  res.status(HTTP_STATUS.SUCCESS).json({
    status: 'success',
    message: '루트 페이지!',
  });
});

// 404 에러 핸들링
app.use((req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    status: 'error',
    message: '페이지를 찾을 수 없습니다.',
  });
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack); // 에러 로그 출력
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: err.message || '서버 에러가 발생했습니다.',
  });
});

// 서버 시작
app.listen(app.get('port'), () => {
  console.log(`Server started on http://localhost:${app.get('port')}`);
});
