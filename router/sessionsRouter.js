const Router = require('express')

const SessoinsController = require('../controllers/sessionsController')

const router = new Router()

router.post('/', SessoinsController.create)

module.exports = router