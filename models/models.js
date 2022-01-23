const {DataTypes} = require('sequelize')

const sequelize = require('../db')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false}
})

const Movies = sequelize.define('movies', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, unique: true, allowNull: false},
    year: {type: DataTypes.INTEGER, allowNull: false},
    format: {type: DataTypes.ENUM('VHS', 'DVD', 'Blu-Ray'), allowNull: false}
})

const Actors = sequelize.define('actors', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    actor: {type: DataTypes.STRING, unique: true, allowNull: false, notEmpty: true}
})

const MoviesActors = sequelize.define('movies_actors', {}, {timestamps: false})

Movies.belongsToMany(Actors, {through: MoviesActors})
Actors.belongsToMany(Movies, {through: MoviesActors})

module.exports = {
    User,
    Movies,
    Actors,
    MoviesActors
}