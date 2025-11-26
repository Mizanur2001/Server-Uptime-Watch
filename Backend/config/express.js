const express = require('express')
const cors = require('cors')
const routers = require('../routes/index.routes')

const app = express()

//Middlewares
app.use(express.json())


//Enable Cors
app.use(cors({}))


//Stablishing  the Router
app.use('/', routers)


module.exports = app