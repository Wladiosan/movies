const ApiError = require('../error/ApiError')

module.exports = function (err, req, res, next) {
    if (err instanceof ApiError) {
        res.status(err.status).json({
            status: 0,
            message: err.message
        })
    }
    return res.status(500).json({
        status: 0,
        message: 'Unexpected error!'
    })
}