const Router = require('express')

const MoviesController = require('../controllers/moviesController')

const router = new Router()

router.post('/', MoviesController.create)
router.delete('/:id', MoviesController.delete)
router.patch('/:id', MoviesController.update)
router.get('/:id', MoviesController.show)
router.get('/', MoviesController.list)
router.post('/import', MoviesController.import)

module.exports = router