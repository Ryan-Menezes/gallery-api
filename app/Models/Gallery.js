const mongoose = require('mongoose')

const Schema = mongoose.Schema
const GallerySchema = new Schema({
    title: {
        type: String,
        required: [true, 'The field title is required'],
        unique: [true, 'The title must be unique']
    },
    slug: {
        type: String,
        required: [true, 'The field slug is required'],
        unique: [true, 'The slug must be unique']
    },
    description: {
        type: String,
        required: [true, 'The field description is required']
    },
    medias: [
        {
            type: Schema.Types.ObjectId,
            ref: 'medias'
        }
    ],
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('galleries', GallerySchema)

module.exports = mongoose.model('galleries')