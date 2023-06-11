const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const isAdmin = require('../middleware/isAdmin')
const router = express.Router()

const {createUser, login, getAllUsers, getAUser, deleteUser, updateUser, handleRefreshToken, logout, updatePassword, forgotPassword, resetPassword} = require('../controllers/userCtrl')


router.post('/register', createUser)
router.post('/login',  login)
router.get('/refresh', handleRefreshToken)
router.get('/logout', logout)
router.post('/forgot', forgotPassword)
router.patch('/reset/:token', resetPassword)


router.get('/getUsers' ,authMiddleware, isAdmin,getAllUsers)
router.get('/getAUser/:id',authMiddleware, isAdmin, getAUser)
router.get('/deleteUser/:id', deleteUser)
router.patch('/edit-user', authMiddleware, updateUser)
router.patch('/update-password', authMiddleware, updatePassword)




module.exports = router