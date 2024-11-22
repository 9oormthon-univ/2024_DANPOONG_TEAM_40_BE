const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: false,
  },
  searchType: {
    type: String,
    enum: ['place', 'route', 'place-detail'],
    required: true,
  },
  searchData: {
    placeId: { type: String, required: true }, // 장소 ID
    placeName: { type: String, required: true }, // 장소명
    placeBizName: { type: String, required: true },
    coordinates: {
      latitude: { type: String, required: true }, // 위도
      longitude: { type: String, required: true }, // 경도
    },
  },
  searchTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SearchLog', searchLogSchema);
