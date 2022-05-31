const fs = require('fs')
const path = require('path')
const multer = require('multer')
const Str = require('./Str')
const storage = require('../../config/storage')

module.exports = class Storage{
    constructor(){
        this.upload = null

        const destination = path.join(__dirname, '..', '..', storage.upload.destination, storage.pathMedias)

        this.upload = multer({
            dist: destination,
            storage: multer.diskStorage({
                destination: (req, file, cb) => {
                    cb(null, destination)
                },
                filename: (req, file, cb) => {
                    const date = new Date()
                    const parts = file.originalname.split('.')
                    const extension = parts[parts.length - 1]
        
                    parts.pop()
        
                    cb(null, Str.slugify(date.toISOString() + '-' + parts.join('-')) + '.' + extension)
                }
            }),
            limits: {
                fileSize: 1024 * 1024 * 5
            },
            fileFilter: (req, file, cb) => {
                cb(null, Boolean(file.mimetype.match(/^image/ig)))
            }
        })
    }

    single(fieldname){
        return this.upload.single(fieldname)
    }
}