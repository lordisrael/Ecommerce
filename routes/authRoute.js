const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const isAdmin = require('../middleware/isAdmin')
const router = express.Router()

const {createUser, login, getAllUsers, getAUser, deleteUser, updateUser, handleRefreshToken, logout, updatePassword, forgotPassword, resetPassword, adminLogin, getWishList, saveAddress} = require('../controllers/userCtrl')
const { userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrder, updateOrderStatus } = require('../controllers/productsCtrl')
const auth = require('../middleware/authMiddleware')


router.post('/register', createUser)
router.post('/login',  login)
router.post('/admin-login', adminLogin)
router.get('/refresh', handleRefreshToken)
router.get('/logout', logout)
router.post('/forgot', forgotPassword)
router.patch('/reset/:token', resetPassword)
router.put('/order/update-order/:id', authMiddleware, isAdmin, updateOrderStatus)

router.post('/cart/create-order', authMiddleware, createOrder)
router.post('/apply-coupon', authMiddleware, applyCoupon)
router.post('/cart', authMiddleware,userCart)
router.get('/cart',authMiddleware, getUserCart)
router.get('/get-order', authMiddleware, getOrder)
router.delete('/empty-cart', authMiddleware, emptyCart)

router.get('/getUsers' ,authMiddleware, isAdmin,getAllUsers)
router.get('/getAUser/:id',authMiddleware, isAdmin, getAUser)
router.get('/wishlist',authMiddleware, getWishList)
router.delete('/deleteUser/:id', deleteUser)

router.put('/save-address', authMiddleware, saveAddress)
router.put('/edit-user', authMiddleware, updateUser)
router.put('/update-password', authMiddleware, updatePassword)




module.exports = router