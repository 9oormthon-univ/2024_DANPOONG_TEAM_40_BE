const mongoose = require('mongoose');

const LiftSchema = new mongoose.Schema({
  sbwy_stn_nm: { type: String }, // 지하철역 이름
  sbwy_stn_cd: { type: String }, // 지하철역 코드
  sgg_cd: { type: String }, // 시군구 코드
  emd_nm: { type: String }, // 읍면동 이름
  emd_cd: { type: String }, // 읍면동 코드
  node_wkt: { type: String }, // 지리 정보 (POINT)
  node_type_cd: { type: String }, // 노드 타입 코드
  sgg_nm: { type: String }, // 시군구 이름
  node_type: { type: String }, // 노드 타입
  node_id: { type: Number, required: true, unique: true }, // 노드 ID
});
LiftSchema.index({ node_wkt: '2dsphere' });
module.exports = mongoose.model('Lift', LiftSchema);
