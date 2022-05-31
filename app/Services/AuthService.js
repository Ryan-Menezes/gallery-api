const User = require('../Models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const endpoint = 'auth/'

module.exports = {
    validate: async (req, res, next) => {
        try{
            const data = req.body

            User.findOne({
                email: data.email
            }).lean()
            .then(async user => {
                const result = await bcrypt.compareSync(data.password, user.password)

                if(!result){
                    const error = new Error('Invalid email or password')
                    error.httpStatusCode = 400
                    return next(error)
                }

                jwt.sign({
                    id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email
                }, req.config.jwt.secret, {
                    expiresIn: req.config.jwt.expiresIn
                }, (error, token) => {
                    if(error){
                        error.httpStatusCode = 400
                        error.message = 'Invalid email or password'
                        return next(error)
                    }

                    const status = 200
                    const message = req.config['http-responses'].status[status]

                    res.status(status).json({
                        status,
                        message,
                        token
                    })
                })
            })
            .catch(error => {
                error.httpStatusCode = 400
                error.message = 'Invalid email or password'
                next(error)
            })
        }catch(error){
            error.httpStatusCode = 400
            error.message = 'Invalid email or password'
            next(error)
        }
    }
}