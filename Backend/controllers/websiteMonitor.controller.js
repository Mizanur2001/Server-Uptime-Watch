const axios = require("axios");
const Website = require("../models/website.models");
const { HandleError, HandleSuccess, HandleServerError } = require("../controllers/Base.Controller");
const { Mail } = require("../services/index.services");

const DOWN_CONFIRMATION_MS = 2 * 60 * 1000; // 2 minutes

module.exports = {
  checkWebsites: async (req, res, cronMode = false) => {
    try {
      const websites = await Website.find().populate("serverId");

      if (!websites.length) {
        return HandleError(res, "No websites found to monitor");
      }

      const results = [];

      for (const w of websites) {
        try {
          const start = Date.now();
          await axios.get(w.domain, { timeout: 6000 });
          const latency = Date.now() - start;

          await Website.updateOne(
            { _id: w._id },
            { status: "UP", latency, lastCheck: new Date(), alertSent: false, downSince: null }
          );

          results.push({
            domain: w.domain,
            status: "UP",
            latency,
            name: w.serverId?.name || "",
            ip: w.serverId?.ip || "",
            lastCheck: new Date()
          });

        } catch (err) {
          const now = new Date();
          const downSince = w.downSince ? new Date(w.downSince) : null;
          const firstTimeDown = w.status !== "DOWN" || !downSince;

          if (firstTimeDown) {
            // Mark DOWN, start timer; do NOT email yet
            await Website.updateOne(
              { _id: w._id },
              {
                status: "DOWN",
                latency: null,
                lastCheck: now,
                downSince: now,
                alertSent: false,
              }
            );
          } else {
            const downForMs = now - downSince;
            const shouldEmail = cronMode === true && !w.alertSent && downForMs >= DOWN_CONFIRMATION_MS;

            const update = { status: "DOWN", latency: null, lastCheck: now };

            if (shouldEmail) {
              const emailed = await Mail.sendWebsiteDownEmail(w.serverId?.name || "", w.domain);
              if (emailed) {
                update.alertSent = true;
              }
            }

            await Website.updateOne({ _id: w._id }, update);
          }

          results.push({
            domain: w.domain,
            status: "DOWN",
            latency: null,
            name: w.serverId?.name || "",
            ip: w.serverId?.ip || "",
            lastCheck: now,
            error: err.message
          });
        }
      }

      // CRON mode
      if (cronMode === true) {
        return results;
      }

      // API mode
      return HandleSuccess(res, results, "Website monitoring completed.");

    } catch (err) {
      return HandleServerError(req, res, err);
    }
  }
};
