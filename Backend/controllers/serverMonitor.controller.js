const axios = require("axios");
const Server = require("../models/server.models");
const { HandleError, HandleSuccess, HandleServerError } = require("../controllers/Base.Controller");
const { Mail } = require("../services/index.services");

const DOWN_CONFIRMATION_MS = 2 * 60 * 1000; // 2 minutes

module.exports = {
  checkServers: async (req, res, cronMode = false) => {
    try {
      const servers = await Server.find();

      if (!servers.length) {
        return HandleError(res, "No servers found to monitor");
      }

      const results = [];

      for (const s of servers) {
        try {
          const response = await axios.get(`http://${s.ip}/health`, {
            headers: { "x-api-key": s.apiKey },
            timeout: 6000,
          });

          // Convert bytes to GB with rounding
          const memUsedGB = (response.data.memUsed / (1024 * 1024 * 1024)).toFixed(2);
          const memTotalGB = (response.data.memTotal / (1024 * 1024 * 1024)).toFixed(2);
          const diskUsedGB = (response.data.diskUsed / (1024 * 1024 * 1024)).toFixed(2);
          const diskTotalGB = (response.data.diskTotal / (1024 * 1024 * 1024)).toFixed(2);

          await Server.updateOne(
            { _id: s._id },
            {
              status: "UP",
              lastPing: new Date(),
              cpu: response.data.cpu,
              memUsed: memUsedGB,
              memTotal: memTotalGB,
              diskUsed: diskUsedGB,
              diskTotal: diskTotalGB,
              alertSent: false,
              downSince: null,
            }
          );

          results.push({
            name: s.name,
            status: "UP",
            cpu: response.data.cpu,
            memUsed: memUsedGB + " GB",
            memTotal: memTotalGB + " GB",
            diskUsed: diskUsedGB + " GB",
            diskTotal: diskTotalGB + " GB",
            ip: s.ip,
            lastPing: new Date(),
            id: s._id,
          });

        } catch (err) {
          const now = new Date();
          const downSince = s.downSince ? new Date(s.downSince) : null;
          const firstTimeDown = s.status !== "DOWN" || !downSince;

          if (firstTimeDown) {
            // Mark DOWN, start timer; do NOT email yet
            await Server.updateOne(
              { _id: s._id },
              {
                status: "DOWN",
                lastPing: now,
                downSince: now,
                alertSent: false,
              }
            );
          } else {
            const downForMs = now - downSince;
            const shouldEmail = cronMode === true && !s.alertSent && downForMs >= DOWN_CONFIRMATION_MS;

            const update = { status: "DOWN", lastPing: now };

            if (shouldEmail) {
              const emailed = await Mail.sendServerDownEmail(s.name, s.ip);
              if (emailed) {
                update.alertSent = true;
              }
            }

            await Server.updateOne({ _id: s._id }, update);
          }

          results.push({
            name: s.name,
            status: "DOWN",
            error: err.message,
            ip: s.ip,
            id: s._id
          });

        }
      }

      // CRON mode
      if (cronMode === true) {
        return results;
      }

      // API mode
      return HandleSuccess(res, results, "Server monitoring completed.");

    } catch (err) {
      return HandleServerError(req, res, err);
    }
  }
};