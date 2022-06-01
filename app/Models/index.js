const path = require('path')
const fs = require('fs')

const paths = {}
fs.readdirSync(__dirname).forEach(file => {
    if(file !== '.' && file !== '..' && file !== __filename){
        const name = file.replace(/\..*/ig, '')

        paths[name] = require(path.join(__dirname, file))
    }
})

module.exports = paths