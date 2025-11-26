const dns = require("dns");
const Website = require("../models/website.models");
const Server = require("../models/Server.models");
const { HandleError, HandleSuccess, HandleServerError } = require("./Base.Controller");

module.exports = {
  addWebsite: async (req, res) => {
    try {
      const { domain, serverId } = req.body;

      if (!domain || !serverId) {
        return HandleError(res, "Missing required fields: domain, serverId");
      }

      const server = await Server.findById(serverId);
      if (!server) {
        return HandleError(res, "Invalid serverId, server not found");
      }

      // Extract hostname from URL
      const hostname = domain.replace(/^https?:\/\//, "").split("/")[0];

      // DNS Lookup
      dns.lookup(hostname, async (err, address) => {
        if (err) {
          return HandleError(res, "DNS lookup failed — Invalid domain");
        }

        console.log("Resolved IP:", address);
        console.log("Server IP:", server.ip);

        if (address !== server.ip) {
          return HandleError(
            res,
            `Website does not belong to this server. DNS IP: ${address}, Server IP: ${server.ip}`
          );
        }

        const website = await Website.create({
          domain,
          serverId,
          status: "UNKNOWN",
          latency: null,
          lastCheck: null,
        });

        return HandleSuccess(res, website, "Website added successfully and validated!");
      });

    } catch (err) {
      return HandleServerError(req, res, err);
    }
  },

  getWebsites: async (req, res) => {
    try {
      const websites = await Website.find().populate("serverId");
      return HandleSuccess(res, websites, "Website list fetched successfully");
    } catch (err) {
      return HandleServerError(req, res, err);
    }
  },
};
