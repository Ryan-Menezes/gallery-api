// Dependencies Global
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')

// Dependencies Local
const config = {}
fs.readdirSync(path.join(__dirname, 'config')).forEach(file => {
    const name = file.replace(/\..*/ig, '')

    config[name] = require(`./config/${file}`)
})

// Generate directories
fs.mkdir(path.join(__dirname, config.storage.upload.destination, config.storage.pathMedias), (error) => {})

// Instances
const app = express()

// Settings Global
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(express.static(path.join(__dirname, config.storage.upload.destination)))

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
fs.readdirSync(path.join(__dirname, 'routes')).forEach(file => {
    if(file !== '.' && file !== '..'){
        const endpoint = file.replace(/\..*/ig, '')

        app.use(`/${endpoint}`, require(`./routes/${file}`))
    }
})

// -- Routes Errors
app.use(async (req, res, next) => {
    const error = new Error()
    error.httpStatusCode = 404
    next(error)
})

app.use(async (error, req, res, next) => {
    const status = error.httpStatusCode || 500
    const message = error.message || config['http-responses'].status[status]
    const errors = error.httpErrors || []

    res.status(status).json({
        status,
        message,
        errors
    })
})

module.exports = app