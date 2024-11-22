const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
  placeId: { type: String, required: true }, // 장소 ID
  name: { type: String, required: true }, // 장소 이름
  lat: { type: Number, required: true }, // 위도
  lon: { type: Number, required: true }, // 경도
  imageUrl: { type: String, default: null }, // 이미지 URL
  address: { type: String, required: true }, // 주소
  nearbyStation: { type: String, default: '알 수 없음' }, // 근처 역명
});

const ListSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // 사용자 ID
  name: { type: String, required: true }, // 리스트 이름
  places: { type: [PlaceSchema], default: [] }, // 장소 배열
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('List', ListSchema);
