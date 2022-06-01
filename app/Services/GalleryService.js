const { Gallery, Media } = require('../Models/index')
const bcrypt = require('bcryptjs')
const ErrorUtil = require('../Util/Error')
const StorageUtil = require('../Util/Storage')

const endpoint = 'galleries/'

module.exports = {
    index: async (req, res, next) => {
        const skip = req.query.skip || req.config.paginate.skip
        const limit = req.query.limit || req.config.paginate.limit

        try{
            const galleries = await Gallery.find({}, {
                medias: false
            }).skip(skip).limit(limit).lean()

            const status = galleries.length ? 200 : 204
            const message = req.config['http-responses'].status[status]

            res.status(status).json({
                status,
                message,
                galleries
            })
        }catch(error){
            next(error)
        }
    },

    show: async (req, res, next) => {
        const slug = req.params.slug

        try{
            Gallery.findOne({
                slug
            }, {
                medias: false
            }).lean()
            .then(gallery => {
                if(!gallery){
                    const error = new Error()
                    error.httpStatusCode = 404
                    return next(error)
                }

                const status = 200
                const message = req.config['http-responses'].status[status]

                res.status(status).json({
                    status,
                    message,
                    gallery
                })
            })
            .catch(error => {
                error.httpStatusCode = 404
                error.message = 'Not Found'
                next(error)
            })
        }catch(error){
            next(error)
        }
    },

    store: async (req, res, next) => {
        const data = req.body

        try{
            const gallery = new Gallery({
                title:          data.title,
                slug:           data.slug,
                description:    data.description
            })

            gallery.save()
            .then(response => {
                const status = 201
                const message = req.config['http-responses'].status[status]

                res.setHeader('Location', `${req.config.app.url}${endpoint}${response._id}`)
                res.status(status).json({
                    status,
                    message,
                    gallery
                })
            })
            .catch(error => {
                error.httpStatusCode = 400
                error.httpErrors = ErrorUtil.parse(error)
                next(error)
            })
        }catch(error){
            next(error)
        }
    },

    update: async (req, res, next) => {
        const slug = req.params.slug
        const data = req.body

        try{
            Gallery.findOne({
                slug
            }, {
                medias: false
            }).lean()
            .then(async gallery => {
                if(!gallery){
                    const error = new Error()
                    error.httpStatusCode = 404
                    return next(error)
                }
    
                Gallery.updateOne({
                    _id: gallery._id
                }, {
                    title:          data.title          || gallery.title,
                    slug:           data.slug           || gallery.slug,
                    description:    data.description    || gallery.description
                })
                .then(response => {
                    const status = 200
                    const message = req.config['http-responses'].status[status]
    
                    res.status(status).json({
                        status,
                        message,
                        response: response
                    })
                })
                .catch(error => {
                    error.httpStatusCode = 400
                    error.httpErrors = ErrorUtil.parse(error)
                    next(error)
                })
            })
            .catch(error => {
                error.httpStatusCode = 404
                error.message = 'Not Found'
                next(error)
            })
        }catch(error){
            next(error)
        }
    },

    delete: async (req, res, next) => {
        const slug = req.params.slug

        try{
            Gallery.findOne({
                slug
            }, {
                medias: false
            }).lean()
            .then(async gallery => {
                if(!gallery){
                    const error = new Error()
                    error.httpStatusCode = 404
                    return next(error)
                }

                Gallery.deleteOne({
                    _id: gallery._id
                })
                .then(response => {
                    const status = 200
                    const message = req.config['http-responses'].status[status]

                    res.status(status).json({
                        status,
                        message,
                        gallery
                    })
                })
                .catch(error => next(error))
            })
            .catch(error => {
                error.httpStatusCode = 404
                error.message = 'Not Found'
                next(error)
            })
        }catch(error){
            next(error)
        }
    },

    showImages: async (req, res, next) => {
        const slug = req.params.slug

        try{
            Gallery.findOne({
                slug
            }).populate('medias').lean()
            .then(gallery => {
                if(!gallery){
                    const error = new Error()
                    error.httpStatusCode = 404
                    return next(error)
                }

                const status = gallery.medias.length ? 200 : 204
                const message = req.config['http-responses'].status[status]

                res.status(status).json({
                    status,
                    message,
                    images: gallery.medias.map(media => {
                        media.url = `${req.config.app.url}${req.config.storage.pathMedias}/${media.filename}`
                        return media
                    })
                })
            })
            .catch(error => {
                error.httpStatusCode = 404
                error.message = 'Not Found'
                next(error)
            })
        }catch(error){
            next(error)
        }
    },

    storeImage: async (req, res, next) => {
        const storage = new StorageUtil()
        const slug = req.params.slug
        const file = req.file

        try{
            if(!file){
                const error = new Error('Image file is required to complete the upload')
                error.httpStatusCode = 400
                return next(error)
            }

            Gallery.findOne({
                slug
            }).lean()
            .then(async gallery => {
                if(!gallery){
                    const error = new Error()
                    error.httpStatusCode = 404
                    return next(error)
                }

                const media = new Media({
                    filename: file.filename,
                    mimetype: file.mimetype
                })

                await media.save()

                Gallery.updateOne({
                    _id: gallery._id
                }, {
                    $addToSet: {
                        medias: media._id
                    }
                })
                .then(response => {
                    media.url = `${req.config.app.url}${req.config.storage.pathMedias}/${media.filename}`

                    const status = 201
                    const message = req.config['http-responses'].status[status]
    
                    res.status(status).json({
                        status,
                        message,
                        image: media
                    })
                })
                .catch(error => {
                    Media.deleteOne({
                        _id: media._id
                    })
                    .then(async response => {
                        await storage.remove(media.filename)
                    })

                    next(error)
                })
            })
            .catch(error => {
                (async () => await storage.remove(file.filename))()

                error.httpStatusCode = 404
                error.message = 'Not Found'
                next(error)
            })
        }catch(error){
            (async () => await storage.remove(file.filename))()

            next(error)
        }
    },

    deleteImage: async (req, res, next) => {
        const storage = new StorageUtil()
        const id = req.params.id

        try{
            Media.findOne({
                _id: id
            }).lean()
            .then(media => {
                if(!media){
                    const error = new Error()
                    error.httpStatusCode = 404
                    return next(error)
                }

                Media.deleteOne({
                    _id: id
                }).lean()
                .then(async response => {
                    await storage.remove(media.filename)

                    const status = 200
                    const message = req.config['http-responses'].status[status]
    
                    res.status(status).json({
                        status,
                        message,
                        image: media
                    })
                })
                .catch(error => next(error))
            })
            .catch(error => {
                error.httpStatusCode = 404
                error.message = 'Not Found'
                next(error)
            })
        }catch(error){
            next(error)
        }
    }
}