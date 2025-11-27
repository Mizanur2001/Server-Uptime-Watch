const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
    name: String,
    ip: String,
    port: { type: Number, default: 4000 },
    apiKey: String,
    status: { type: String, default: "UNKNOWN" },
    lastPing: Date,
    cpu: Number,
    memUsed: Number,
    memTotal: Number,
    diskUsed: Number,
    diskTotal: Number,
    alertSent: { type: Boolean, default: false },
});

module.exports = mongoose.model("Server", serverSchema);
