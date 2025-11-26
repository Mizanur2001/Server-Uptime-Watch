const express = require('express')
const router = express.Router()
const { ServerMonitor, server } = require('../controllers/index.controller');

router.get("/check", ServerMonitor.checkServers);
router.post("/add", server.addServer);
router.get("/", server.getServers);


module.exports = router;