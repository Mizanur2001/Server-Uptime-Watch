const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth.middleware');
const { ServerMonitor, server } = require('../controllers/index.controller');

router.get("/check", authMiddleware, ServerMonitor.checkServers);
router.post("/add", authMiddleware, server.addServer);
router.get("/", authMiddleware, server.getServers);


module.exports = router;