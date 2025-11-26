const Server = require("../models/Server.models");
const { HandleError, HandleSuccess, HandleServerError } = require("./Base.Controller");

module.exports = {
    addServer: async (req, res) => {
        try {
            const { name, ip, port, apiKey } = req.body;

            if (!name || !ip || !apiKey) {
                return HandleError(res, "Missing required fields: name, ip, apiKey");
            }

            const server = await Server.create({
                name,
                ip,
                port: port || 4000,
                apiKey,
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
            const servers = await Server.find();
            return HandleSuccess(res, servers, "Server list fetched successfully");
        } catch (err) {
            return HandleServerError(req, res, err);
        }
    },
};
