module.exports = {
    slugify: (str, separator = '-') => {
        return str
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, separator) 
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9 ]/g, separator)
            .replace(/\s+/g, separator)
    }
}