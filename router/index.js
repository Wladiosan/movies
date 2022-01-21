const Router = require('express')

const usersRouter = require('./usersRouter')
const sessionsRouter = require('./sessionsRouter')
const moviesRouter = require('./moviesRouter')

const router = new Router()

router.use('/users', usersRouter)
router.use('/sessions', sessionsRouter)
router.use('/movies', moviesRouter)

module.exports = router