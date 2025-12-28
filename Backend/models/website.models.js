const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema({
  domain: String,
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: "Server" },
  status: { type: String, default: "UNKNOWN" },
  latency: Number,
  lastCheck: Date,
  downSince: { type: Date, default: null },
  alertSent: { type: Boolean, default: false },
});

module.exports = mongoose.model("Website", websiteSchema);