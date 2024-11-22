const mongoose = require('mongoose');

const ElevatorSchema = new mongoose.Schema(
  {
    sbwy_stn_nm: { type: String, default: null }, // 지하철역명
    sbwy_stn_cd: { type: String, default: null }, // 지하철역 코드
    sgg_cd: { type: String, required: true }, // 시군구 코드
    emd_nm: { type: String, required: true }, // 읍면동 이름
    emd_cd: { type: String, required: true }, // 읍면동 코드
    node_wkt: { type: String, required: true }, // 노드 위치 (WKT 형식)
    node_type_cd: { type: String, required: true }, // 노드 타입 코드
    sgg_nm: { type: String, required: true }, // 시군구 이름
    node_type: { type: String, required: true }, // 노드 타입
    node_id: { type: Number, required: true, unique: true }, // 노드 ID
  },
  { timestamps: true }
);
ElevatorSchema.index({ node_wkt: '2dsphere' });
module.exports = mongoose.model('Elevator', ElevatorSchema);
