const jwt = require('jsonwebtoken')

const generateJwt = (id, email, name) => {
    return jwt.sign({id, email, name}, process.env.SECRET_KEY, {expiresIn: '24h'})
}

module.exports = {
    generateJwt
}
