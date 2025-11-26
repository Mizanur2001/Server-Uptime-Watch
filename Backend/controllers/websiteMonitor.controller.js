const axios = require("axios");
const Website = require("../models/website.models");
const { HandleError, HandleSuccess, HandleServerError } = require("../controllers/Base.Controller");

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
            { status: "UP", latency, lastCheck: new Date() }
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
          await Website.updateOne(
            { _id: w._id },
            { status: "DOWN", latency: null, lastCheck: new Date() }
          );

          results.push({
            domain: w.domain,
            status: "DOWN",
            latency: null,
            name: w.serverId?.name || "",
            ip: w.serverId?.ip || "",
            lastCheck: new Date(),
            error: err.message
          });

          // ::::::::::::::TODO:::::::::::: Trigger alert only on state change
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
