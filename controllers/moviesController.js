const {Op} = require('sequelize')
const uuid = require('uuid')
const path = require('path')
const fs = require('fs')

const {Movies, Actors, MoviesActors} = require('../models/models')
const ApiError = require('../error/ApiError')
const {resolve} = require('path')

class MoviesController {

    async create(req, res, next) {
        const {title, year, format} = req.body
        let {actors} = req.body

        if (!title || !year || !format || !actors.length) {
            next(ApiError.badRequest('Some fields are empty'))
        }

        if (format !== 'DVD' && format !== 'VHS' && format !== 'Blu-Ray') {
            next(ApiError.badRequest('Field format is incorrect'))
        }

        if (typeof year !== "number") {
            next(ApiError.badRequest('Year field must be number'))
        }

        if (year > 2022 || year < 1940) {
            next(ApiError.badRequest('The year field is incorrect'))
        }

        const checkMovie = await Movies.findOne({
            where: {title}
        })

        if (checkMovie) {
            next(ApiError.badRequest('Such movie already exist'))
        }

        const movie = await Movies.create({title, year, format})

        await Promise.all(actors.map(
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
                attributes: ['id', 'actor', 'createdAt', 'updatedAt'],
                through: {
                    attributes: []
                }
            }
        })

        return res.status(201).json(data)
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

    async update(req, res, next) {
        const {id} = req.params
        const {title, year, format} = req.body
        let {actors} = req.body

        const updateMovie = await Movies.findOne({
            where: {id}
        })

        if (!updateMovie) {
            next(ApiError.badRequest('Movie with this id not found'))
        }

        if (title) {
            const checkFreeTitle = await Movies.findOne({
                where: {title}
            })

            if (checkFreeTitle) {
                next(ApiError.badRequest('This title already exist'))
            }

            await updateMovie.update({title})
        }

        if (format) {
            if (format !== 'DVD' && format !== 'VHS' && format !== 'Blu-Ray') {
                next(ApiError.badRequest('Field format is incorrect'))
            }
            await updateMovie.update({format})
        }

        if (year) {
            if (typeof year !== "number") {
                next(ApiError.badRequest('Year field must be number'))
            }

            if (year > 2022 || year < 1940) {
                next(ApiError.badRequest('The year field is incorrect'))
            }

            await updateMovie.update({year})
        }

        if (actors.length) {
            await MoviesActors.destroy({
                where: {movieId: updateMovie.id}
            })

            await Promise.all(actors.map(
                async actor => {
                    const checkActor = await Actors.findOne({
                        where: {actor}
                    })

                    if (!checkActor) {
                        const actorResponse = await Actors.create({actor})
                        await MoviesActors.bulkCreate([{
                            movieId: updateMovie.id,
                            actorId: actorResponse.id
                        }])
                        return
                    }

                    await MoviesActors.bulkCreate([{
                        movieId: updateMovie.id,
                        actorId: checkActor.id
                    }])
                }
            ))
        }

        const movieUpdated = await Movies.findOne({
            where: {id},
            attributes: ['id', 'title', 'year', 'format'],
            include: {
                model: Actors,
                attributes: ['id', 'actor', 'createdAt', 'updatedAt'],
                through: {
                    attributes: []
                }
            }
        })

        return res.status(200).json({data: movieUpdated})

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

        return res.json({data: movieRes})
    }

    async list(req, res, next) {
        let {actor, title, search, sort, order, limit, page} = req.query
        let offset

        console.log(actor, title, search, sort, order, limit, page)

        actor = actor ? actor.charAt(0).toUpperCase() + title.slice(1) : null
        title = title ? title.charAt(0).toUpperCase() + title.slice(1) : null
        search = search ? search.charAt(0).toUpperCase() + title.slice(1) : null
        sort = sort ? sort.toLowerCase() : 'id'
        order = order ? order.toUpperCase() : 'ASC'
        limit = limit || 10
        page = page || 1
        offset = page * limit - limit || 0

        /*if (sort !== 'id' || sort !== 'title' || sort !== 'year' || sort !== 'format' || sort !== 'createdAt' || sort !== 'updatedAt') {
            next(ApiError.badRequest('Sort field was entered incorrectly'))
        }*/

        /*if (order !== 'ASC' || order !== 'DESC') {
            next(ApiError.badRequest('Order field war entered incorrectly'))
        }*/


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

        return res.json({data: movieRes})

    }

    async import(req, res, next) {
        const formData = req.files.formData
        let fileName = uuid.v4() + '.txt'

        if (!formData) {
            next(ApiError.badRequest('File not found'))
        }

        await formData.mv(path.resolve(__dirname, '..', 'static', fileName))

        let importList = []
        let finishArrMovies = []
        let movieIds = []

        const importMovie = new Promise(resolve => {
            const dataFile = fs.readFileSync(`${path.resolve(__dirname, '..', 'static', fileName)}`, 'utf8')

            dataFile.split('\n\n').map(
                arr => importList.push(arr.split('\n'))
            )

            resolve()
        })

        importMovie
            .then(() => {
                importList.map(t => {
                    let obj = {}

                    obj.title = t['0'].substr(7)
                    obj.year = +t['1'].substr(14)
                    obj.format = t['2'].substr(8)
                    obj.stars = t['3'].substr(7).split(', ')

                    if (!obj.title || !obj.year || !obj.format || !obj.stars.length) {
                        return console.log(`Field format type is incorrect in ${obj.title} movie`)
                    }

                    if (typeof obj.year !== "number" || isNaN(obj.year)) {
                        return console.log(`Field year type is not number in ${obj.title} movie`)
                    }

                    if (obj.format !== 'DVD' && obj.format !== 'VHS' && obj.format !== 'Blu-Ray') {
                        return console.log(`Field year type is not number in ${obj.title} movie`)
                    }

                    if (obj.year > 2022 || obj.year < 1940) {
                        return console.log(`Field year has incorrect range in ${obj.title} movie`)
                    }

                    finishArrMovies.push(obj)
                })
            })
            .then(async () => {
                await Promise.all(finishArrMovies.map(
                    async arr => {
                        const checkMovie = await Movies.findOne({
                            where: {title: arr.title}
                        })

                        if (checkMovie) {
                            movieIds.push(checkMovie.id)
                            return
                        }

                        const movie = await Movies.create({
                            title: arr.title,
                            year: arr.year,
                            format: arr.format
                        })

                        movieIds.push(movie.id)

                        console.log("Array all actors: ", arr.stars)

                        await Promise.all(arr.stars.map(
                            async actor => {

                                const promise1 = new Promise(async () => {
                                    const checkActor = await Actors.findOne({
                                        where: {actor}
                                    })
                                    resolve(checkActor)
                                })

                                promise1.then( checkActor => {
                                    console.log('checkMovie2: ', checkMovie)
                                })

                                // const checkActor = await Actors.findOne({
                                //     where: {actor}
                                // })

                                /*if (!checkActor) {
                                    // console.log(`Insert actor: ${actor}`)
                                    const actorResponse = await Actors.create({actor})
                                    // console.log('actorResponseID: ', actorResponse.id)
                                    await MoviesActors.bulkCreate([{
                                        movieId: movie.id,
                                        actorId: actorResponse.id
                                    }])
                                    return
                                }

                                await MoviesActors.bulkCreate([{
                                    movieId: movie.id,
                                    actorId: checkActor.id
                                }])*/

                                /*const [actorCheck, created] = await Actors.findOrCreate({
                                    where: {actor}
                                })

                                console.log(`Operation with actor name: ${actorCheck.actor}, flag: ${created}`)

                                if (created) {
                                    await MoviesActors.bulkCreate([{
                                        movieId: movie.id,
                                        actorId: actorCheck.id
                                    }])
                                }*/
                            }
                        )).catch(e => {
                            console.log('Message error: ', e.message)
                        })
                    }))
            })
            .then(async () => {
                console.log(movieIds)
                const data = await Movies.findAll({
                    where: {
                        id: [...movieIds]
                    },
                    include: {
                        model: Actors,
                        attributes: ['id', 'actor'],
                        through: {
                            attributes: []
                        }
                    }
                })
                res.json({data})
            })
    }

    /*async import(req, res, next) {
        const formData = req.files.formData
        let fileName = uuid.v4() + '.txt'

        if (!formData) {
            next(ApiError.badRequest('File not found'))
        }

        await formData.mv(path.resolve(__dirname, '..', 'static', fileName))

        let importList = []
        let finishArrMovies = []
        let movieIds = []

        const importMovie = new Promise(resolve => {
            const dataFile = fs.readFileSync(`${path.resolve(__dirname, '..', 'static', fileName)}`, 'utf8')

            dataFile.split('\n\n').map(
                arr => importList.push(arr.split('\n'))
            )

            resolve()
        })

        importMovie
            .then(() => {
                importList.map(t => {
                    let obj = {}

                    obj.title = t['0'].substr(7)
                    obj.year = +t['1'].substr(14)
                    obj.format = t['2'].substr(8)
                    obj.stars = t['3'].substr(7).split(', ')

                    if (!obj.title || !obj.year || !obj.format || !obj.stars.length) {
                        return console.log(`Field format type is incorrect in ${obj.title} movie`)
                    }

                    if (typeof obj.year !== "number" || isNaN(obj.year)) {
                        return console.log(`Field year type is not number in ${obj.title} movie`)
                    }

                    if (obj.format !== 'DVD' && obj.format !== 'VHS' && obj.format !== 'Blu-Ray') {
                        return console.log(`Field year type is not number in ${obj.title} movie`)
                    }

                    if (obj.year > 2022 || obj.year < 1940) {
                        return console.log(`Field year has incorrect range in ${obj.title} movie`)
                    }

                    finishArrMovies.push(obj)
                })
            })
            .then(async () => {
                await Promise.all(finishArrMovies.map(async arr => {
                    const checkMovie = await Movies.findOne({
                        where: {title: arr.title}
                    })

                    if (checkMovie) {
                        movieIds.push(checkMovie.id)
                        return
                    }

                    const movie = await Movies.create({
                        title: arr.title,
                        year: arr.year,
                        format: arr.format
                    })

                    movieIds.push(movie.id)

                    await arr.stars.map(
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
                    )
                }))
            })
            .then(async () => {
                console.log(movieIds)
                const data = await Movies.findAll({
                    where: {
                        id: [...movieIds]
                    },
                    include: {
                        model: Actors,
                        attributes: ['id', 'actor'],
                        through: {
                            attributes: []
                        }
                    }
                })
                res.json({data})
            })
    }*/
}

module.exports = new MoviesController()