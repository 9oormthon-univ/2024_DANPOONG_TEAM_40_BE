const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // 사용자 ID
  placeId: { type: String, required: true }, // 장소 ID
  wheelchairAccess: { type: Number, required: true, min: 0, max: 5 }, // 휠체어 접근성
  service: { type: Number, required: true, min: 0, max: 5 }, // 서비스
  taste: { type: Number, min: 0, max: 5 }, // 맛
  reviewText: { type: String, required: true, minlength: 20 }, // 리뷰 텍스트
  images: [{ type: String }], // 업로드된 이미지 경로 배열
  createdAt: { type: Date, default: Date.now }, // 생성 날짜
});

module.exports = mongoose.model('Review', reviewSchema);
