const router = require('express').Router()

const GalleryService = require('../app/Services/GalleryService')

router.get('/', GalleryService.index)
router.get('/:slug', GalleryService.show)
router.post('/', GalleryService.store)
router.put('/:slug', GalleryService.update)
router.delete('/:slug', GalleryService.delete)

module.exports = router