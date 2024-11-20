const mongoose = require('mongoose');

const connect = () => {
  if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', true);
  }

  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: 'moduegil',
      // useUnifiedTopology: true,
      // serverSelectionTimeoutMS: 30000, // 30초 동안 연결을 시도
    })
    .then(() => {
      console.log('몽고디비 연결 성공');
    })
    .catch((err) => {
      console.error('몽고디비 연결 에러', err);
    });
};

mongoose.connection.on('error', (error) => {
  console.error('몽고디비 연결 에러', error);
});

mongoose.connection.on('disconnected', () => {
  console.error('몽고디비 연결이 끊어졌습니다. 연결을 재시도 합니다');
  connect();
});

module.exports = connect;