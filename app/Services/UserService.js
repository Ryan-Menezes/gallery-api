const User = require('../Models/User')
const bcrypt = require('bcryptjs')

module.exports = {
    index: async (req, res, next) => {
        try{
            const users = await User.find().lean()

            const status = users.length ? 200 : 204
            const message = req.config.httpResponses.status[status]

            res.status(status).json({
                status,
                message,
                users
            })
        }catch(error){
            next(error)
        }
    },

    show: async (req, res, next) => {
        try{
            const id = req.params.id

            User.findOne({
                _id: id
            }).lean()
            .then(user => {
                const status = 200
                const message = req.config.httpResponses.status[status]

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
            const data = req.body.data

            if(data.password){
                const salt = await bcrypt.genSaltSync()
                data.password = await bcrypt.hashSync(data.password, salt)
            }

            const user = new User({
                first_name:     data.first_name,
                last_name:      data.last_name,
                email:          data.email,
                password:       data.password
            })

            const response = await user.save()
            console.log(response)
        }catch(error){
            next(error)
        }
    },

    update: async (req, res, next) => {

    },

    delete: async (req, res, next) => {

    }
}