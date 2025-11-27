const express = require("express");
const router = express.Router();
const Auth = require("../controllers/auth.controller");

// router.post("/register", Auth.register); // Registration disabled for security reasons
router.post("/login", Auth.login);

module.exports = router;