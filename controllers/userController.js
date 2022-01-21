const bcrypt = require('bcrypt')

const ApiError = require('../error/ApiError')
const {User} = require('../models/models')
const {generateJwt} = require('../helpers/generateJWT')

class UserController {

    async create(req, res, next) {
        const {email, name, password, confirmPassword} = req.body

        if (!email || !name || !password || !confirmPassword) {
            return next(ApiError.badRequest('Fields must not be empty'))
        }

        if (password !== confirmPassword) {
            return next(ApiError.badRequest('Password mismatch'))
        }

        const candidate = await User.findOne({where: {email}})
        console.log('candidate: ', candidate)

        if (candidate) {
            return next(ApiError.badRequest('Such email already exist'))
        }

        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({email, password: hashPassword, name})

        const token = generateJwt(user.id, user.email, user.name)

        return res.status(201).json({status: 1, token})

    }
}

module.exports = new UserController()