const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const routers = require('../routes/index.routes')

const app = express()

// ─── Security Headers (Helmet) ────────────────────────────────
// Sets X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.
app.use(helmet())

// ─── CORS – restrict to your frontend origin(s) ──────────────
const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean)

app.use(cors({
    origin: allowedOrigins.length
        ? (origin, cb) => {
            // Allow requests with no origin (mobile apps, curl, server-to-server)
            if (!origin) return cb(null, true)
            if (allowedOrigins.includes(origin)) return cb(null, true)
            return cb(new Error('Not allowed by CORS'))
        }
        : false, // Block all cross-origin if no origins configured
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    maxAge: 86400,
}))

// ─── Body Parser with size limit (prevent DoS via large payloads) ─
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))

// ─── NoSQL Injection Protection (Express 5 compatible) ────────
// express-mongo-sanitize is incompatible with Express 5 (req.query is read-only),
// so we use a custom middleware that sanitizes values in-place.
function sanitizeValue(val) {
    if (val === null || val === undefined) return val
    if (typeof val === 'string') return val
    if (Array.isArray(val)) return val.map(sanitizeValue)
    if (typeof val === 'object') {
        const clean = {}
        for (const key of Object.keys(val)) {
            // Strip keys starting with $ or containing . (MongoDB operators)
            if (key.startsWith('$') || key.includes('.')) continue
            clean[key] = sanitizeValue(val[key])
        }
        return clean
    }
    return val
}

app.use((req, _res, next) => {
    // Sanitize body and params in-place (these are writable in Express 5)
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body)
    }
    if (req.params && typeof req.params === 'object') {
        for (const key of Object.keys(req.params)) {
            req.params[key] = sanitizeValue(req.params[key])
        }
    }
    // req.query is read-only in Express 5, but query string injection
    // is already mitigated by our type-checking in controllers
    next()
})

// ─── HTTP Parameter Pollution Protection ──────────────────────
app.use(hpp())

// ─── Global Rate Limiter ──────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,                 // max 200 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', error: 'Too many requests, please try again later.' },
})
app.use(globalLimiter)

// ─── Strict Auth Rate Limiter (login / register) ─────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,                  // max 10 login attempts per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', error: 'Too many login attempts. Try again in 15 minutes.' },
})
app.use('/api/v1/auth', authLimiter)

// ─── Disable X-Powered-By (info leakage) ─────────────────────
app.disable('x-powered-by')

// ─── Trust proxy (required for rate limiting behind reverse proxy / DigitalOcean load balancer) ─
app.set('trust proxy', 1)

// ─── Routes ───────────────────────────────────────────────────
app.use('/', routers)


module.exports = app