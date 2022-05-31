const Gallery = require('../Models/Gallery')
const bcrypt = require('bcryptjs')
const Error = require('../Util/Error')

const endpoint = 'galleries/'

module.exports = {
    index: async (req, res, next) => {
        try{
            const skip = req.query.skip || req.config.paginate.skip
            const limit = req.query.limit || req.config.paginate.limit

            const galleries = await Gallery.find().skip(skip).limit(limit).lean()

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
        try{
            const slug = req.params.slug

            Gallery.findOne({
                slug
            }).lean()
            .then(gallery => {
                if(!gallery){
                    const error = new Error()
                    error.httpStatusCode = 404
                    next(error)
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
        try{
            const data = req.body

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
                error.httpErrors = Error.parse(error)
                next(error)
            })
        }catch(error){
            next(error)
        }
    },

    update: async (req, res, next) => {
        try{
            const slug = req.params.slug
            const data = req.body

            Gallery.findOne({
                slug
            }).lean()
            .then(async gallery => {
                if(!gallery){
                    const error = new Error()
                    error.httpStatusCode = 404
                    next(error)
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
                    error.httpErrors = Error.parse(error)
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
        try{
            const slug = req.params.slug

            Gallery.findOne({
                slug
            }).lean()
            .then(async gallery => {
                if(!gallery){
                    const error = new Error()
                    error.httpStatusCode = 404
                    next(error)
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
    }
}