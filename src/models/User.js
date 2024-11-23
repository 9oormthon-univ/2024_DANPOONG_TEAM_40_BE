const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  kakaoId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  profileImage: String,
  isRegistered: { type: Boolean, default: false }, // 회원가입 완료 여부
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);