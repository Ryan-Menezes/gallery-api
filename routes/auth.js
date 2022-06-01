const router = require('express').Router()

const AuthService = require('../app/Services/AuthService')

router.get('/', AuthService.validate)

module.exports = router