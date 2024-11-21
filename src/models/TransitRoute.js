const mongoose = require('mongoose');

const TransitRouteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  routeId: { type: String, required: true },
  routeDetails: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});

module.exports = mongoose.model('TransitRoute', TransitRouteSchema);
