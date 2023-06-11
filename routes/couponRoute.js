const express = require('express')
const router = express.Router()
const { createCoupon, getAllCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponCtrl')

const isAdmin= require('../middleware/isAdmin')
const auth = require('../middleware/authMiddleware')


router.post('/', auth, isAdmin, createCoupon)
router.get('/', auth, isAdmin, getAllCoupon)
router.put('/:id', auth, isAdmin, updateCoupon)
router.delete('/:id', auth, isAdmin, deleteCoupon)

module.exports = router