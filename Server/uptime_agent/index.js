const express = require("express");
const si = require("systeminformation");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Security headers
app.use(helmet());

// Disable CORS entirely - agent should only accept requests from the monitoring backend
// Do NOT use cors() here

const API_KEY = process.env.MONITOR_KEY;

if (!API_KEY || API_KEY.length < 16) {
    console.error("FATAL: MONITOR_KEY must be set and at least 16 characters!");
    process.exit(1);
}

// Rate limit: max 30 requests per minute
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests" },
});
app.use(limiter);

const NETWORK_SAMPLE_INTERVAL_MS = 1000;

let lastNetSample = null;
let latestNetSpeed = {
    uploadMBps: 0,
    downloadMBps: 0,
    timestamp: null,
};

const isLikelyLoopback = (ifaceName) => {
    const name = String(ifaceName || "").toLowerCase();
    return (
        name === "lo" ||
        name.includes("loopback") ||
        name.includes("pseudo")
    );
};

const sumNetworkBytes = (stats) => {
    const rows = Array.isArray(stats) ? stats : [];
    let rxBytes = 0;
    let txBytes = 0;

    for (const row of rows) {
        if (!row) continue;
        if (isLikelyLoopback(row.iface)) continue;
        if (typeof row.rx_bytes === "number") rxBytes += row.rx_bytes;
        if (typeof row.tx_bytes === "number") txBytes += row.tx_bytes;
    }

    return { rxBytes, txBytes };
};

const startNetworkSampler = () => {
    const tick = async () => {
        try {
            const stats = await si.networkStats();
            const { rxBytes, txBytes } = sumNetworkBytes(stats);
            const now = Date.now();

            if (!lastNetSample) {
                lastNetSample = { rxBytes, txBytes, atMs: now };
                latestNetSpeed = {
                    uploadMBps: 0,
                    downloadMBps: 0,
                    timestamp: new Date(),
                };
                return;
            }

            const elapsedSec = Math.max((now - lastNetSample.atMs) / 1000, 0.001);
            const downloadBytesPerSec = Math.max((rxBytes - lastNetSample.rxBytes) / elapsedSec, 0);
            const uploadBytesPerSec = Math.max((txBytes - lastNetSample.txBytes) / elapsedSec, 0);

            latestNetSpeed = {
                uploadMBps: Number((uploadBytesPerSec / (1024 * 1024)).toFixed(2)),
                downloadMBps: Number((downloadBytesPerSec / (1024 * 1024)).toFixed(2)),
                timestamp: new Date(),
            };

            lastNetSample = { rxBytes, txBytes, atMs: now };
        } catch {
            // Keep previous values if sampling fails.
        }
    };

    tick();
    setInterval(tick, NETWORK_SAMPLE_INTERVAL_MS);
};

startNetworkSampler();

const crypto = require("crypto");

app.use((req, res, next) => {
    const providedKey = req.headers["x-api-key"];
    
    // Reject if no key or wrong type
    if (!providedKey || typeof providedKey !== 'string') {
        return res.status(403).json({ error: "Access Forbidden" });
    }

    // Constant-time comparison to prevent timing attacks
    const keyBuffer = Buffer.from(providedKey);
    const apiKeyBuffer = Buffer.from(API_KEY);
    
    if (keyBuffer.length !== apiKeyBuffer.length || !crypto.timingSafeEqual(keyBuffer, apiKeyBuffer)) {
        return res.status(403).json({ error: "Access Forbidden" });
    }
    
    next();
});

app.get("/health", async (req, res) => {
    try {
        const cpuLoad = await si.currentLoad();
        const mem = await si.mem();
        const disk = await si.fsSize();

        res.json({
            status: "UP",
            cpu: Math.round(cpuLoad.currentLoad),
            memUsed: mem.active,
            memTotal: mem.total,
            diskUsed: disk[0].used,
            diskTotal: disk[0].size,
            netUploadMBps: latestNetSpeed.uploadMBps,
            netDownloadMBps: latestNetSpeed.downloadMBps,
            netSpeedTimestamp: latestNetSpeed.timestamp,
            timestamp: new Date(),
        });
    } catch (error) {
        res.status(500).json({
            status: "ERROR", error: error.message
        });
    }
});

app.listen(process.env.AGENT_PORT || 4000, () => {
    console.log(`Monitoring Agent ON :${process.env.AGENT_PORT || 4000}`);
});
