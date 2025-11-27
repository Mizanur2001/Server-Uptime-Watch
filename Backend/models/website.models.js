const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema({
  domain: String,
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: "Server" },
  status: { type: String, default: "UNKNOWN" },
  latency: Number,
  lastCheck: Date,
  alertSent: { type: Boolean, default: false },
});

module.exports = mongoose.model("Website", websiteSchema);