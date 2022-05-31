const bcrypt = require('bcryptjs')

const User = require('../Models/User')
const Media = require('../Models/Media')
const Error = require('../Util/Error')

const endpoint = 'users/'

module.exports = {
    index: async (req, res, next) => {
        try{
            const skip = req.query.skip || req.config.paginate.skip
            const limit = req.query.limit || req.config.paginate.limit

            const users = await User.find({
                deleted_at: null
            }, {
                password: false
            }).populate('avatar').skip(skip).limit(limit).lean()

            const status = users.length ? 200 : 204
            const message = req.config['http-responses'].status[status]

            res.status(status).json({
                status,
                message,
                users: users.map(user => {
                    user.avatar = user.avatar ? `${req.config.app.url}${req.config.storage.pathMedias}/${user.avatar.filename}` : null
                    return user
                })
            })
        }catch(error){
            next(error)
        }
    },

    show: async (req, res, next) => {
        try{
            const id = req.params.id

            User.findOne({
                _id: id,
                deleted_at: null
            }, {
                password: false
            }).populate('avatar').lean()
            .then(user => {
                if(!user){
                    const error = new Error()
                    error.httpStatusCode = 404
                    next(error)
                }

                user.avatar = user.avatar ? `${req.config.app.url}${req.config.storage.pathMedias}/${user.avatar.filename}` : null

                const status = 200
                const message = req.config['http-responses'].status[status]

                res.status(status).json({
                    status,
                    message,
                    user
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
            const file = req.file
            let media = null
            let user = null

            if(data.password && data.password.length >= 8){
                const salt = await bcrypt.genSaltSync(Number(req.config.password.hash.salt))
                data.password = await bcrypt.hashSync(data.password, salt)
            }

            if(file){
                media = new Media({
                    filename: file.filename,
                    mimetype: file.mimetype
                })

                await media.save()

                user = new User({
                    first_name:     data.first_name,
                    last_name:      data.last_name,
                    email:          data.email,
                    password:       data.password,
                    avatar:         media._id
                })
            }else{
                user = new User({
                    first_name:     data.first_name,
                    last_name:      data.last_name,
                    email:          data.email,
                    password:       data.password
                })
            }

            user.save()
            .then(response => {
                const status = 201
                const message = req.config['http-responses'].status[status]

                delete user.password

                res.setHeader('Location', `${req.config.app.url}${endpoint}${response._id}`)
                res.status(status).json({
                    status,
                    message,
                    user
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
            const id = req.params.id
            const data = req.body

            User.findOne({
                _id: id,
                deleted_at: null
            }, {
                password: false
            }).lean()
            .then(async user => {
                if(!user){
                    const error = new Error()
                    error.httpStatusCode = 404
                    next(error)
                }

                user.avatar = user.avatar ? `${req.config.app.url}${req.config.storage.pathMedias}/${user.avatar.filename}` : null
    
                if(data.password && data.password.length >= 8){
                    const salt = await bcrypt.genSaltSync(Number(req.config.password.hash.salt))
                    data.password = await bcrypt.hashSync(data.password, salt)
                }
    
                User.updateOne({
                    _id: user._id
                }, {
                    first_name:     data.first_name || user.first_name,
                    last_name:      data.last_name  || user.last_name,
                    email:          data.email      || user.email,
                    password:       data.password   || user.password
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
            const id = req.params.id
            const data = req.body

            User.findOne({
                _id: id,
                deleted_at: null
            }, {
                password: false
            }).populate('avatar').lean()
            .then(async user => {
                if(!user){
                    const error = new Error()
                    error.httpStatusCode = 404
                    next(error)
                }

                user.avatar = user.avatar ? `${req.config.app.url}${req.config.storage.pathMedias}/${user.avatar.filename}` : null

                if(!data.force){
                    User.updateOne({
                        _id: user._id
                    }, {
                        deleted_at: Date.now()
                    })
                    .then(async response => {
                        //await fs.unlinkSync()

                        const status = 200
                        const message = req.config['http-responses'].status[status]

                        res.status(status).json({
                            status,
                            message,
                            user
                        })
                    })
                    .catch(error => next(error))
                }else{
                    User.deleteOne({
                        _id: user._id
                    })
                    .then(response => {
                        const status = 200
                        const message = req.config['http-responses'].status[status]

                        res.status(status).json({
                            status,
                            message,
                            user
                        })
                    })
                    .catch(error => next(error))
                }
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