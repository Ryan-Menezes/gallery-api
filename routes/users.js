const router = require('express').Router()

const UserService = require('../app/Services/UserService')

router.get('/', UserService.index)
router.get('/:id', UserService.show)

module.exports = router