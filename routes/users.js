const router = require('express').Router()

const UserService = require('../app/Services/UserService')
const Storage = require('../app/Util/Storage')
const storage = new Storage()

router.get('/', UserService.index)
router.get('/:id', UserService.show)
router.post('/', storage.single('avatar'), UserService.store)
router.put('/:id', UserService.update)
router.delete('/:id', UserService.delete)

module.exports = router