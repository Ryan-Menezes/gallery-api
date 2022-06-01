const router = require('express').Router()

const auth = require('../app/Middlewares/auth')
const GalleryService = require('../app/Services/GalleryService')
const StorageUtil = require('../app/Util/Storage')
const storage = new StorageUtil()

router.get('/', auth.default, GalleryService.index)
router.get('/:slug', auth.default, GalleryService.show)
router.post('/', auth.required, GalleryService.store)
router.put('/:slug', auth.required, GalleryService.update)
router.delete('/:slug', auth.required, GalleryService.delete)
router.get('/:slug/images', auth.default, GalleryService.showImages)
router.post('/:slug/images', auth.required, storage.single('image'), GalleryService.storeImage)
router.delete('/:slug/images/:id', auth.required, GalleryService.deleteImage)

module.exports = router