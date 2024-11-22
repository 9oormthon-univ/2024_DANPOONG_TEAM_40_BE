const mongoose = require('mongoose');

const RecommendSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true }, // 장소 이름
  imageUrl: { type: String }, // 이미지 URL
  month: { type: Number, required: true }, // 월 (1 ~ 12)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Recommend', RecommendSchema);
