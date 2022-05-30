// Dependencies Global
const path = require('path')
const express = require('express')
const mongoose = require('mongoose')

// Dependencies Local
const config = {
    database:           require('./config/database'),
    httpResponses:      require('./config/http-responses')
}

// Instances
const app = express()

// Settings Global
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

// Database connect
mongoose.Promise = global.Promise
mongoose.connect(`mongodb://${config.database.mongodb.host}:${config.database.mongodb.port}/${config.database.mongodb.name}`)
.then(response => console.log('MongoDB Connected!'))
.catch(error => console.log('MongoDB NOT Connected: ', error))

// Middlewares
app.use(async (req, res, next) => {
    req.config = config

    next()
})

// Routes
app.use('/users', require('./routes/users'))

// -- Routes Errors
app.use(async (req, res, next) => {
    const error = new Error()
    error.httpStatusCode = 404
    next(error)
})

app.use(async (error, req, res, next) => {
    const status = error.httpStatusCode ?? 500
    const message = error.message ?? config.httpResponses.status[status]
    
    res.status(status).json({
        status,
        message
    })
})

module.exports = app