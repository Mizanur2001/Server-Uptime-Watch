const dns = require("dns");
const mongoose = require("mongoose");
const Website = require("../models/website.models");
const Server = require("../models/server.models");
const { HandleError, HandleSuccess, HandleServerError } = require("./Base.Controller");

// Allowed URL schemes
const SAFE_URL_RE = /^https?:\/\/[a-zA-Z0-9][a-zA-Z0-9.-]+/;

module.exports = {
  addWebsite: async (req, res) => {
    try {
      const { domain, serverId } = req.body;

      // Type-check inputs
      if (!domain || typeof domain !== 'string' ||
          !serverId || typeof serverId !== 'string') {
        return HandleError(res, "Missing required fields: domain, serverId (must be strings)");
      }

      // Validate domain looks like a URL (prevent SSRF with internal IPs)
      if (!SAFE_URL_RE.test(domain.trim())) {
        return HandleError(res, "Domain must be a valid http:// or https:// URL");
      }

      // Validate serverId is a valid MongoDB ObjectId (prevent injection)
      if (!mongoose.Types.ObjectId.isValid(serverId)) {
        return HandleError(res, "Invalid serverId format");
      }

      const server = await Server.findById(serverId);
      if (!server) {
        return HandleError(res, "Invalid serverId, server not found");
      }

      // Extract hostname from URL
      const hostname = domain.trim().replace(/^https?:\/\//, "").split("/")[0];

      // Reject private/internal IPs (prevent SSRF)
      const privatePatterns = ['localhost', '127.0.0.1', '0.0.0.0', '10.', '172.16.', '172.17.',
        '172.18.', '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.',
        '172.25.', '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.',
        '192.168.', '169.254.', '[::1]'];
      if (privatePatterns.some(p => hostname.toLowerCase().startsWith(p))) {
        return HandleError(res, "Internal/private addresses are not allowed");
      }

      // DNS Lookup
      dns.lookup(hostname, async (err, address) => {
        if (err) {
          return HandleError(res, "DNS lookup failed — Invalid domain");
        }

        if (address !== server.ip) {
          return HandleError(
            res,
            `Website does not belong to this server. DNS resolved to a different IP.`
          );
        }

        const website = await Website.create({
          domain: domain.trim(),
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
      const websites = await Website.find().populate("serverId", "-apiKey"); // don't leak apiKey
      return HandleSuccess(res, websites, "Website list fetched successfully");
    } catch (err) {
      return HandleServerError(req, res, err);
    }
  },
};
