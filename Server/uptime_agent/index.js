const express = require("express");
const si = require("systeminformation");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const API_KEY = process.env.MONITOR_KEY;

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

app.use((req, res, next) => {
    if (req.headers["x-api-key"] !== API_KEY) {
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
