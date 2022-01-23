require('dotenv').config()
const express = require('express')
const cors = require('cors')

const sequelize = require('./db')
const router = require('./router/index')
const ErrorHandler = require('./middleware/ErrorHandlerMiddleware')

const PORT = process.env.PORT || 8000
const app = new express()

app.use(cors())
app.use(express.json())
app.use('/api/v1', router)

app.use(ErrorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server started at port: ${PORT}`))
    } catch (e) {
        console.log('Message: ', e.message)
    }
}

start()