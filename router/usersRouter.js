const Router = require('express')

const UserController = require('../controllers/userController')

const router = new Router()

router.post('/', UserController.create)

module.exports = router