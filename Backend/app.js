const app = require('./config/express')
const db = require('./config/db')
const dotenv = require('dotenv').config()
const http = require("http");
const { initializeSocket } = require("./config/socket"); 

const PORT = process.env.PORT;

// Create HTTP server
const server = http.createServer(app);

async function start() {
    // Connect DB
    await db.Connectdb();

    // Init socket on same server
    initializeSocket(server);

    // Now start cron (AFTER socket + DB)
    require("./config/cronBot");

    // Start server WITH SOCKET IO
    server.listen(PORT, () => {
        console.log(`Server is Listening on ${PORT} 🚀`);
    });
}

start();
