const Coupon = require('../models/coupon')
const { StatusCodes } = require('http-status-codes')
const asyncHandler = require('express-async-handler')
const {BadRequestError, NotFoundError} = require('../errors')

const createCoupon = asyncHandler(async(req, res) => {
    const coupon = await Coupon.create(req.body)
    res.status(StatusCodes.OK).json({coupon, msg: 'Coupon, created'})

})

const getAllCoupon = asyncHandler(async(req, res) => {
    const coupon = await Coupon.find( )
    res.status(StatusCodes.OK).json({coupon})

})
const updateCoupon = asyncHandler(async(req, res) => {
    const {id: couponId } = req.params
    const coupon = await Coupon.findByIdAndUpdate({_id:couponId}, req.body, {
        new: true
    })
    if(!coupon) {
        throw new NotFoundError(`No product with id: ${couponId} found` )
    }
    res.status(StatusCodes.OK).json({coupon, msg: 'Coupon updated'})

})

const deleteCoupon = asyncHandler(async(req, res) => {
    const {id: couponId } = req.params
    const coupon = await Coupon.findByIdAndDelete({_id:couponId})
    if(!coupon) {
        throw new NotFoundError(`No product with id: ${couponId} found` )
    }
    res.status(StatusCodes.OK).json({coupon, msg: 'Coupon deleted'})

})
module.exports = {
    createCoupon,
    getAllCoupon,
    updateCoupon,
    deleteCoupon
}