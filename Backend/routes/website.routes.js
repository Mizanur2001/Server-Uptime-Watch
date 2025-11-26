const express = require('express')
const router = express.Router()
const { websiteMonitor, website } = require('../controllers/index.controller');

router.get("/check", websiteMonitor.checkWebsites);
router.post("/add", website.addWebsite);
router.get("/", website.getWebsites);

module.exports = router;