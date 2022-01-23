const bcrypt = require('bcrypt')

const {User} = require('../models/models')
const ApiError = require('../error/ApiError')
const {generateJwt} = require('../helpers/generateJWT')

class SessionsController {

    async create(req, res, next) {
        const {email, password} = req.body

        if (!email || !password) {
            next(ApiError.badRequest('Fields must not be empty'))
        }

        const user = await User.findOne({
            where: {email}
        })

        if (!user) {
            next(ApiError.badRequest('User with such email does not exist'))
        }

        let comparePassword = bcrypt.compareSync(password, user.password)

        if (!comparePassword) {
            return next(ApiError.badRequest('Incorrect password'))
        }

        const token = generateJwt(user.id, user.email, user.name)

        return res.status(200).json({status: 1, token})
    }
}

module.exports = new SessionsController()
