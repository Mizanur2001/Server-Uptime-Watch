const express = require('express')
const router = express.Router()
const { websiteMonitor, website } = require('../controllers/index.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get("/check", authMiddleware, websiteMonitor.checkWebsites);
router.post("/add", authMiddleware, website.addWebsite);
router.get("/", authMiddleware, website.getWebsites);
module.exports = router;