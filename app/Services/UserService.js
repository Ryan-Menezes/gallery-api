const bcrypt = require('bcryptjs')

const { User, Media } = require('../Models/index')
const ErrorUtil = require('../Util/Error')
const StorageUtil = require('../Util/Storage')

const endpoint = 'users/'

module.exports = {
    index: async (req, res, next) => {
        const query = req.query
        const skip = query.skip || req.config.paginate.skip
        const limit = query.limit || req.config.paginate.limit

        try{
            const total = await User.count()
            const users = await User.find({
                first_name: {
                    $regex: query.first_name || '', 
                    $options: 'i'
                },
                last_name: {
                    $regex: query.last_name || '', 
                    $options: 'i'
                },
                email: {
                    $regex: query.email || '', 
                    $options: 'i'
                },
                deleted_at: null
            }, {
                password: false,
                deleted_at: false,
                __v: false
            }).populate('avatar').skip(skip).limit(limit).lean()

            const status = users.length ? 200 : 204
            const message = req.config['http-responses'].status[status]

            res.status(status).json({
                status,
                message,
                total,
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
        const id = req.params.id

        try{
            User.findOne({
                _id: id,
                deleted_at: null
            }, {
                password: false,
                deleted_at: false,
                __v: false
            }).populate('avatar').lean()
            .then(user => {
                if(!user){
                    const error = new Error()
                    error.httpStatusCode = 404
                    return next(error)
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
        const storage = new StorageUtil()
        const data = req.body
        const file = req.file
        let media = null
        let user = null

        try{
            // If password is valid, hash password
            if(data.password && data.password.length >= 8){
                const salt = await bcrypt.genSaltSync(Number(req.config.password.hash.salt))
                data.password = await bcrypt.hashSync(data.password, salt)
            }

            // verify if exists file to avatar
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

            // Save new user
            user.save()
            .then(response => {
                const status = 201
                const message = req.config['http-responses'].status[status]

                delete user.password
                delete user.deleted_at

                res.setHeader('Location', `${req.config.app.url}${endpoint}${response._id}`)
                res.status(status).json({
                    status,
                    message,
                    user
                })
            })
            .catch(error => {
                if(file){
                    Media.deleteOne({
                        _id: media._id
                    })
                    .then(async response => {
                        await storage.remove(media.filename)
                    })
                }

                error.httpStatusCode = 400
                error.httpErrors = ErrorUtil.parse(error)
                next(error)
            })
        }catch(error){
            (async () => await storage.remove(media.filename))()

            next(error)
        }
    },

    update: async (req, res, next) => {
        const storage = new StorageUtil()
        const id = req.params.id
        const data = req.body
        const file = req.file
        let media = null

        try{
            User.findOne({
                _id: id,
                deleted_at: null
            }, {
                password: false,
                deleted_at: false,
                __v: false
            }).populate('avatar').lean()
            .then(async user => {
                if(!user){
                    const error = new Error()
                    error.httpStatusCode = 404
                    return next(error)
                }

                const filePrevious = user.avatar.filename

                // verify if exists file to avatar
                if(file){
                    media = new Media({
                        filename: file.filename,
                        mimetype: file.mimetype
                    })

                    await media.save()
                    data.avatar = media._id
                }
    
                if(data.password && data.password.length >= 8){
                    const salt = await bcrypt.genSaltSync(Number(req.config.password.hash.salt))
                    data.password = await bcrypt.hashSync(data.password, salt)
                }
                
                // Update user
                User.updateOne({
                    _id: user._id
                }, {
                    first_name:     data.first_name || user.first_name,
                    last_name:      data.last_name  || user.last_name,
                    email:          data.email      || user.email,
                    password:       data.password   || user.password,
                    avatar:         data.avatar     || user.avatar._id
                })
                .then(async response => {
                    if(file && filePrevious){
                        await storage.remove(filePrevious)
                    }

                    const status = 200
                    const message = req.config['http-responses'].status[status]
                    
                    res.status(status).json({
                        status,
                        message,
                        response: response
                    })
                })
                .catch(error => {
                    if(file){
                        Media.deleteOne({
                            _id: media._id
                        })
                        .then(async response => {
                            await storage.remove(media.filename)
                        })
                    }

                    error.httpStatusCode = 400
                    error.httpErrors = ErrorUtil.parse(error)
                    next(error)
                })
            })
            .catch(error => {
                if(file){
                    (async () => await storage.remove(file.filename))()
                }

                error.httpStatusCode = 404
                error.message = 'Not Found'
                next(error)
            })
        }catch(error){
            if(file){
                (async () => await storage.remove(file.filename))()
            }

            next(error)
        }
    },

    delete: async (req, res, next) => {
        const storage = new StorageUtil()
        const id = req.params.id
        const data = req.body

        try{
            User.findOne({
                _id: id,
                deleted_at: null
            }, {
                password: false,
                deleted_at: false,
                __v: false
            }).populate('avatar').lean()
            .then(async user => {
                if(!user){
                    const error = new Error()
                    error.httpStatusCode = 404
                    return next(error)
                }

                // Verify if is softdelete
                if(!data.force){
                    User.updateOne({
                        _id: user._id
                    }, {
                        deleted_at: Date.now()
                    })
                    .then(async response => {
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
                    .then(async response => {
                        await Media.deleteOne({
                            _id: user.avatar._id
                        })
                        
                        // Remove file avatar
                        await storage.remove(user.avatar.filename)

                        // Response
                        const status = 200
                        const message = req.config['http-responses'].status[status]

                        user.avatar = user.avatar ? `${req.config.app.url}${req.config.storage.pathMedias}/${user.avatar.filename}` : null
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