const jwt = require('jsonwebtoken')

module.exports = {
    required: async (req, res, next) => {
        const headers = req.headers
        
        if(!headers || !headers.authorization){
            const error = new Error()
            error.httpStatusCode = 401
            return next(error)
        }

        const token = headers.authorization.replace(/(Bearer\s*)/ig, '')
        
        jwt.verify(token, req.config.jwt.secret, (error, decoded) => {
            if(error){
                error.httpStatusCode = 401
                return next(error)
            }

            req.user = decoded
            next()
        })
    },

    default: async (req, res, next) => {
        const headers = req.headers
        
        if(!headers || !headers.authorization){
            return next()
        }

        const token = headers.authorization.replace(/(Bearer\s*)/ig, '')
        
        jwt.verify(token, req.config.jwt.secret, (error, decoded) => {
            if(error){
                return next()
            }

            req.user = decoded
            next()
        })
    }
}