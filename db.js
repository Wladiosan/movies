const {Sequelize} = require('sequelize')
const path = require('path')

/*module.exports = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT
    }
)*/

module.exports = new Sequelize(
    {
        dialect: 'sqlite',
        storage: path.resolve(__dirname, '', 'database.sqlite')
    }
)
