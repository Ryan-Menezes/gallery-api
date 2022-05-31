const router = require('express').Router()

const AuthService = require('../app/Services/AuthService')

router.post('/', AuthService.validate)

module.exports = router