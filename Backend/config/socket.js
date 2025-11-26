const { Server } = require("socket.io");

let io = null;

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("🔗 Client connected:", socket.id);
    });
}

module.exports = {
    initializeSocket,
    getIO: () => io
};