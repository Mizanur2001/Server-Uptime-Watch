const axios = require("axios");
const Server = require("../models/server.models");
const { HandleError, HandleSuccess, HandleServerError } = require("../controllers/Base.Controller");
const { Mail } = require("../services/index.services");

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

          if (!s.alertSent) {
            // Send Email
            // await Mail.sendServerDownEmail(s.name, s.ip);

            await Server.updateOne(
              { _id: s._id },
              {
                status: "DOWN",
                lastPing: new Date(),
                alertSent: true
              }
            );

          } else {

            await Server.updateOne(
              { _id: s._id },
              { status: "DOWN", lastPing: new Date() }
            );
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