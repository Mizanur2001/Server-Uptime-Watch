const express = require('express')
const router = express.Router()
const path = require('path');
const { ServerMonitor } = require('../controllers/index.controller')
const authMiddleware = require('../middleware/auth.middleware');


//Server Test api
router.get('/', (req, res) => {
    res.status(200).send({
        status: "success",
        code: 200,
        message: "API Server is Running Successfully"
    })
})

// OpenAPI Specification route - protected behind auth in production
if (process.env.NODE_ENV !== 'production') {
    const swaggerUi = require('swagger-ui-express');
    const YAML = require('yamljs');
    const swaggerDocument = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));
    router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    router.get('/openapi.yaml', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'openapi.yaml'));
    });
} else {
    // In production, protect docs behind auth
    const swaggerUi = require('swagger-ui-express');
    const YAML = require('yamljs');
    const swaggerDocument = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));
    router.use('/docs', authMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    router.get('/openapi.yaml', authMiddleware, (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'openapi.yaml'));
    });
}


router.use("/api/v1/server", require("./server.routes"));
router.use("/api/v1/website", require("./website.routes"));
router.use("/api/v1/auth", require("./auth.routes"));


// No router found
router.use((req, res) => {
    res.status(404);
    res.json({ status: "failed", error: "Router not found." });
});




module.exports = router