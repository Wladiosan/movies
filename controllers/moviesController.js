const {Op} = require("sequelize")

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

    async delete(req, res, next) {
        const {id} = req.params

        const idRes = await Movies.findOne({
            where: {id}
        })

        if (!idRes) {
            next(ApiError.badRequest('Movies with such id does not exist'))
        }

        await Movies.destroy({
            where: {id}
        })

        return res.status(200).json({status: 1})
    }

    async update() {

    }

    async show(req, res, next) {
        const {id} = req.params

        const movie = await Movies.findOne({
            where: {id}
        })

        if (!movie) {
            next(ApiError.badRequest('Movies with such id does not exist'))
        }

        const movieRes = await Movies.findOne({
            where: {id},
            attributes: ['id', 'title', 'year', 'format'],
            include: {
                model: Actors,
                attributes: ['id', 'actor'],
                through: {
                    attributes: []
                }
            }
        })

        return res.json({movieRes})
    }

    async list(req, res, next) {
        let {actor, title, search, sort, order, limit, page} = req.query
        let offset

        actor = actor ? actor.charAt(0).toUpperCase() + title.slice(1) : null
        title = title ? title.charAt(0).toUpperCase() + title.slice(1) : null
        search = search ? search.charAt(0).toUpperCase() + title.slice(1) : null
        sort = sort ? sort.toLowerCase() : 'id'
        order = order ? order.toUpperCase() : 'ASC'
        limit = limit || 10
        page = page || 1
        offset = page * limit - limit || 0

        if (sort !== 'id' || sort !== 'title' || sort !== 'year' || sort !== 'format' || sort !== 'createdAt' || sort !== 'updatedAt') {
            next(ApiError.badRequest('Sort field was entered incorrectly'))
        }

        if (order !== 'ASC' || order !== 'DESC') {
            next(ApiError.badRequest('Order field war entered incorrectly'))
        }


        let whereTitleReq = []
        let whereActorReq = []

        if (title) {
            whereTitleReq.push({title: {[Op.substring]: title}})
        }

        if (actor) {
            whereActorReq.push({actor: {[Op.substring]: actor}})
        }

        const movieRes = await Movies.findAll({
            where: [...whereTitleReq],
            attributes: ['id', 'title', 'year', 'format', 'createdAt', 'updatedAt'],
            include: {
                model: Actors,
                where: [...whereActorReq],
                attributes: ['id', 'actor'],
                through: {
                    attributes: []
                }
            },
            order: [[sort, order]],
            limit,
            offset
        })

        return res.json({movieRes})

    }

    async import() {

    }

}

module.exports = new MoviesController()