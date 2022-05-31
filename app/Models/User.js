const mongoose = require('mongoose')

const Schema = mongoose.Schema
const UserSchema = new Schema({
    first_name: {
        type: String,
        required: [true, 'The field first_name is required']
    },
    last_name: {
        type: String,
        required: [true, 'The field last_name is required']
    },
    email: {
        type: String,
        required: [true, 'The field email is required'],
        unique: [true, 'This email is already being used']
    },
    password: {
        type: String,
        required: [true, 'The field password is required'],
        minlength: [8, 'The password must contain at least 8 digits']
    },
    avatar: {
        type: Schema.Types.ObjectId,
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