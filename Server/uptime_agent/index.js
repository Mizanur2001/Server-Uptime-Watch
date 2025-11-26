const express = require("express");
const si = require("systeminformation");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const API_KEY = process.env.MONITOR_KEY;

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
