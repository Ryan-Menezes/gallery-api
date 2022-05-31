module.exports = {
    parse: (error) => {
        const errors = []

        if(error && error.errors){
            for(const e of Object.values(error.errors)){
                errors.push(e.message)
            }
        }

        return errors
    }
}