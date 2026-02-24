const dotenv = require('dotenv').config()

// ─── Validate critical environment variables at startup ───
const REQUIRED_ENV = ['PORT', 'DATABASEURL', 'JWT_SECRET', 'CORS_ORIGINS'];
const missing = REQUIRED_ENV.filter(key => !process.env[key]);
if (missing.length) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    console.error('Create a .env file with these variables before starting the server.');
    process.exit(1);
}

// Warn if JWT_SECRET is too weak
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('WARNING: JWT_SECRET should be at least 32 characters for security!');
}

const app = require('./config/express')
const db = require('./config/db')
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
