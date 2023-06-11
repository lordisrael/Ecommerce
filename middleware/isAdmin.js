const User = require('../models/user')
const { UnauthenticatedError } = require('../errors')
const asyncHandler = require('express-async-handler')
const isAdmin = asyncHandler(async(req, res, next) => {
    const { email } = req.user
    const adminUser = await User.findOne({ email })
    if(adminUser.role != 'admin'){
        throw new UnauthenticatedError('You are not an admin')
    } else {
        next()
    }
})

module.exports = isAdmin