const mongoose = require('mongoose')

const Schema = mongoose.Schema
const UserSchema = new Schema({
    first_name: {
        type: String,
        maxlength: [100, 'The first_name must contain a maximum of 100 digits']
    },
    last_name: {
        type: String,
        maxlength: [100, 'The last_name must contain a maximum of 100 digits']
    },
    email: {
        type: String,
        maxlength: [100, 'The email must contain a maximum of 100 digits'],
        unique: [true, 'This email is already being used'],
        email: [true, 'Email must be a valid email']
    },
    password: {
        type: String,
        min: [8, 'The password must contain at least 8 digits'],
        max: [100, 'The password must contain a maximum of 8 digits']
    },
    avatar: {
        type: mongoose.Types.ObjectId,
        ref: 'medias',
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    },
    deleted_at: {
        type: Date,
        default: null
    }
})

mongoose.model('users', UserSchema)

module.exports = mongoose.model('users')