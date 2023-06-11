//require('cookie-parser')
const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const {NotFoundError, BadRequestError, UnauthenticatedError} = require('../errors')
const { createJWT } = require('../config/jwt')
const {createRefreshJWT} = require('../config/refreshToken')
const {StatusCodes} = require('http-status-codes')
const sendEmail = require('../config/sendEmail')
const crypto = require('crypto')

const createUser = asyncHandler(async(req, res) => {
    const {email} = req.body
    const userAlreadyExist = await User.findOne({email})
    if(!userAlreadyExist){
        const user = await User.create(req.body)
        const token = createJWT(user._id, user.firstname)
        res.status(StatusCodes.CREATED).json({user, token: token })
    } else{
        throw new BadRequestError('Email already exist')
    }
})

const login = asyncHandler(async(req, res) => {
    const {email, password} = req.body
    const user = await User.findOne({email})
    if(user && (await user.comparePassword(password))){
        const refreshToken = await createRefreshJWT(user._id)
       /* const updateUser =*/ await User.findByIdAndUpdate(
            user._id,
            {
                refreshToken: refreshToken
            },
            {new: true}
        )
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000
        })
        // _   id:user._id,
        //     firstname: user.firstname,
        //     secondname: user.secondname,
        //     email: user.email,
        //     mobile: user.email,
        //     token: createJWT(user._id, user.firstname)
        res.status(StatusCodes.OK).json({
            _id:user._id,
            firstname: user.firstname,
            secondname: user.secondname,
            email: user.email,
            mobile: user.mobile,
            token: createJWT(user._id, user.firstname)
        })
    } else {
        throw new UnauthenticatedError('Invalid credentials')
    }
})

const handleRefreshToken = asyncHandler(async(req, res) => {
    const cookie = req.cookies
    if(!cookie.refreshToken) throw new NotFoundError('No refresh token identified')
    const refreshToken = cookie.refreshToken
    const user = await User.findOne({refreshToken})
    if(!user) throw new NotFoundError('No refresh token, not matched in db')
    jwt.verify(refreshToken, process.env.JWT_SECRET, function(err, decoded){
        if(err || user.id != decoded.id){
            throw new UnauthenticatedError('Invalid RefreshToken')
        }
        const token = createJWT(user._id, user.firstname)
        res.json({token})
    })
})


const logout = asyncHandler(async(req, res) => {
    const cookie = req.cookies
    if(!cookie.refreshToken) throw new UnauthenticatedError('No refresh token found')
    const refreshToken = cookie.refreshToken
    const user = await User.findOne({refreshToken})
    if(!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        })
        return res.sendStatus(204)
    }
    await User.findOneAndUpdate({refreshToken}, {
        refreshToken: ""
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true
    })
    return res.sendStatus(204)

})

const updatePassword = asyncHandler(async(req, res) => {
    const {_id } = req.user
    const {password} = req.body
    const user = await User.findById(_id)
    if(password){
        user.password = password
        const updatedPassword = await user.save()
        res.status(StatusCodes.OK).json(updatedPassword)
    } else {
        throw new NotFoundError('Not found')
        //res.json(user)
    }
})

const forgotPassword = asyncHandler(async(req, res) => {
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        throw new NotFoundError('No User with this given email')
    } 
    const resetToken = user.createPasswordResetToken()
    await user.save()

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset/${resetToken}`
    const msg = `We have recieved a password reset request, please use the below link to reset your password\n\n${resetUrl}\n\nThis reset password link expires in 10 minutes`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password change request received',
            message: msg
        })
        res.status(StatusCodes.OK).json({
            status: 'Success',
            msg: 'Reset link set to user'
        })
    } catch (error) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        user.save()
        throw new UnauthenticatedError('There was error sending password reset token')
    }
})

const resetPassword = asyncHandler(async(req, res) => {
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({passwordResetToken: token,
    passwordResetExpires: {$gt: Date.now()}})
    if(!user){
        throw new NotFoundError('Token is Invalid or expires')
    }
    user.password = req.body.password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.passwordChangedAt = Date.now()

    user.save()
    const tokenJWT = createJWT(user._id, user.firstname)
    res.status(StatusCodes.OK).json({user: {name: user.firstname}, tokenJWT})
})

const getAllUsers = asyncHandler(async (req, res) => {
    const getUsers = await User.find({role: 'user'})
    res.status(StatusCodes.OK).json({getUsers})
})

const getAUser = asyncHandler(async(req, res) => {
    const {id: UserId} = req.params
    const getAUser = await User.findOne({_id: UserId})
    if(!getAUser){
        throw new NotFoundError(`User with id: ${UserId} is not found`)
    }
    res.status(StatusCodes.OK).json(getAUser)
    
})

const updateUser = asyncHandler(async(req, res) => {
    const {_id} = req.user
    const user = await User.findByIdAndUpdate({_id},
        {
            firstname: req.body.firstname,
            lastname: req.body.lastname
        },
        {
            new: true,
            runValidators: true
        })
    if(!user){
        throw new NotFoundError(`User with id: ${UserId} is not found`)
    }
    res.status(StatusCodes.OK).json({user, msg: {msg: 'User updated'}})
    
})

const deleteUser = asyncHandler(async(req, res) => {
    const {id: UserId} = req.params
    const deleteUser = await User.findByIdAndDelete({_id: UserId})
    if(!deleteUser){
        throw new NotFoundError(`User with id: ${UserId} is not found`)
    }
    res.status(StatusCodes.OK).json({deleteUser, msg: {msg: 'User deleted'}})
    
})
module.exports = {
    createUser,
    login,
    getAllUsers,
    getAUser,
    updateUser,
    updatePassword,
    deleteUser,
    handleRefreshToken,
    logout,
    forgotPassword,
    resetPassword
}