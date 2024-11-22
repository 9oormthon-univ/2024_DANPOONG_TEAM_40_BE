const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  railOperatorCode: { type: String, required: true },
  railOperatorName: { type: String, required: true },
  lineCode: { type: String, required: true },
  lineName: { type: String, required: true },
  stationCode: { type: String, required: true },
  stationName: { type: String, required: true },
});

module.exports = mongoose.model('Station', stationSchema);
