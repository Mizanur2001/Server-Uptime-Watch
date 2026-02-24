const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

// Parse allowed origins from env (same list as Express CORS)
const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: allowedOrigins.length ? allowedOrigins : false,
            methods: ["GET", "POST"],
            credentials: true,
        },
        // Prevent socket enumeration
        allowEIO3: false,
        // Connection timeout
        connectTimeout: 10000,
    });

    // --- Socket-level rate limiting ---
    const socketConnections = new Map(); // ip -> { count, resetAt }
    const SOCKET_MAX_CONN_PER_IP = 10;
    const SOCKET_WINDOW_MS = 60 * 1000; // 1 minute

    io.use((socket, next) => {
        // Rate limit connections per IP
        const ip = socket.handshake.address;
        const now = Date.now();
        const entry = socketConnections.get(ip) || { count: 0, resetAt: now + SOCKET_WINDOW_MS };

        if (now > entry.resetAt) {
            entry.count = 0;
            entry.resetAt = now + SOCKET_WINDOW_MS;
        }
        entry.count++;
        socketConnections.set(ip, entry);

        if (entry.count > SOCKET_MAX_CONN_PER_IP) {
            return next(new Error("Too many connections"));
        }

        next();
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;

        if (!token || typeof token !== 'string') {
            return next(new Error("Unauthorized"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);
        // Do NOT log socket.user (may contain sensitive data in logs)
    });

    // Clean up rate limit map periodically
    setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of socketConnections) {
            if (now > entry.resetAt) socketConnections.delete(ip);
        }
    }, 60000);
}

module.exports = {
    initializeSocket,
    getIO: () => io
};