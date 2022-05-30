const mongoose = require('mongoose')

const Schema = mongoose.Schema
const MediaSchema = new Schema({
    filename: {
        type: String,
        required: [true, 'The field filename is required'],
        unique: [true, 'The filename must be unique']
    },
    path: {
        type: String,
        required: [true, 'The field path is required'],
        unique: [true, 'The path must be unique']
    },
    mimetype: {
        required: [true, 'The field mimetype is required'],
        type: String
    },
    description: {
        required: [true, 'The field description is required'],
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('medias', MediaSchema)

module.exports = mongoose.model('medias')