const {Movies, Actors, MoviesActors} = require('../models/models')
const ApiError = require('../error/ApiError')

class MoviesController {

    async create(req, res, next) {
        const {title, year, format} = req.body
        let {stars} = req.body

        if (!title || !year || !format || !stars.length) {
            next(ApiError.badRequest('Some fields are empty'))
        }

        if (format !== 'DVD' && format !== 'VHS' && format !== 'Blu-Ray') {
            next(ApiError.badRequest('Field format is incorrect'))
        }

        if (typeof year !== "number") {
            next(ApiError.badRequest('Year field must be number'))
        }

        const checkMovie = await Movies.findOne({
            where: {title}
        })

        if (checkMovie) {
            next(ApiError.badRequest('Such movie already exist'))
        }

        const movie = await Movies.create({title, year, format})

        await Promise.all(stars.map(
            async actor => {
                const checkActor = await Actors.findOne({
                    where: {actor}
                })

                if (!checkActor) {
                    const actorResponse = await Actors.create({actor})
                    await MoviesActors.bulkCreate([{
                        movieId: movie.id,
                        actorId: actorResponse.id
                    }])
                    return
                }

                await MoviesActors.bulkCreate([{
                    movieId: movie.id,
                    actorId: checkActor.id
                }])
            }
        ))

        const data = await Movies.findOne({
            where: {id: movie.id},
            attributes: ['id', 'title', 'year', 'format'],
            include: {
                model: Actors,
                attributes: ['id', 'actor'],
                through: {
                    attributes: []
                }
            }
        })

        return res.status(201).json({data})
    }


    async delete() {

    }

    async update() {

    }

    async show(req, res, next) {
        const {id} = req.params

        const data = await Movies.findOne({
            where: {id}
        })

        if (!data) {
            next(ApiError.badRequest('Movies with such id does not exist'))
        }

        return res.status(200).json({status: 1, data})

    }

    async list() {

    }

    async import() {

    }

}

module.exports = new MoviesController()