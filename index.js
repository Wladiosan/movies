require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const fileUpload = require('express-fileupload')

const sequelize = require('./db')
const router = require('./router/index')
const ApiError = require('./error/ApiError')
const ErrorHandler = require('./middleware/ErrorHandlerMiddleware')

const PORT = process.env.PORT || 8000
const app = new express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api/v1', router)

app.use(ErrorHandler)

const start = async (req, res, next) => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server started at port: ${PORT}`))
    } catch (e) {
        console.log(e.message)
        next(ApiError.internal('Internal Server Error'))
    }
}

start()