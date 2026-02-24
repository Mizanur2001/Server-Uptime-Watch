const Server = require("../models/server.models");
const { HandleError, HandleSuccess, HandleServerError } = require("./Base.Controller");

// Simple IP regex (IPv4)
const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;
// Hostname regex
const HOSTNAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9.-]{0,253}[a-zA-Z0-9]$/;

module.exports = {
    addServer: async (req, res) => {
        try {
            const { name, ip, port, apiKey } = req.body;

            // Type-check all inputs
            if (!name || typeof name !== 'string' ||
                !ip || typeof ip !== 'string' ||
                !apiKey || typeof apiKey !== 'string') {
                return HandleError(res, "Missing required fields: name, ip, apiKey (must be strings)");
            }

            // Validate name length
            if (name.trim().length < 1 || name.trim().length > 100) {
                return HandleError(res, "Server name must be 1-100 characters");
            }

            // Validate IP format (prevent SSRF via arbitrary URLs)
            if (!IPV4_RE.test(ip.trim()) && !HOSTNAME_RE.test(ip.trim())) {
                return HandleError(res, "Invalid IP address or hostname format");
            }

            // Validate port
            const portNum = port ? Number(port) : 4000;
            if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
                return HandleError(res, "Port must be a number between 1 and 65535");
            }

            // Validate apiKey length
            if (apiKey.trim().length < 8 || apiKey.trim().length > 256) {
                return HandleError(res, "API key must be 8-256 characters");
            }

            const server = await Server.create({
                name: name.trim(),
                ip: ip.trim(),
                port: portNum,
                apiKey: apiKey.trim(),
                status: "UNKNOWN",
                lastPing: null,
            });

            return HandleSuccess(res, server, "Server added successfully");
        } catch (err) {
            return HandleServerError(req, res, err);
        }
    },
    getServers: async (req, res) => {
        try {
            // Don't return apiKey to frontend (sensitive data)
            const servers = await Server.find().select('-apiKey');
            return HandleSuccess(res, servers, "Server list fetched successfully");
        } catch (err) {
            return HandleServerError(req, res, err);
        }
    },
};
