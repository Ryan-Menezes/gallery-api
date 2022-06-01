const router = require('express').Router()

const auth = require('../app/Middlewares/auth')
const UserService = require('../app/Services/UserService')
const StorageUtil = require('../app/Util/Storage')
const storage = new StorageUtil()

router.get('/', auth.required, UserService.index)
router.get('/:id', auth.required, UserService.show)
router.post('/', auth.required, storage.single('avatar'), UserService.store)
router.put('/:id', auth.required, storage.single('avatar'), UserService.update)
router.delete('/:id', auth.required, UserService.delete)

module.exports = router