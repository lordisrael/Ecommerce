const Brand = require('../models/brand')
const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
const { NotFoundError } = require('../errors')

const createBrand = asyncHandler(async(req, res) => {
    const brand = await Brand.create(req.body)
    res.status(StatusCodes.CREATED).json({msg: 'Created', brand})

})

const updateBrand = asyncHandler(async(req, res) => {
    const {id: brandId} = req.params
    const brand = await Brand.findByIdAndUpdate({_id: brandId}, req.body, {
        new: true
    })
    if(!brand) {
        throw new NotFoundError(`No Brand with id: ${brandId} found`)
    }
    res.status(StatusCodes.OK).json({msg:'Updated', brand })
})
const deleteBrand = asyncHandler(async(req, res) => {
    const {id: brandId} = req.params
    const brand = await Brand.findByIdAndDelete({_id: brandId})
    if(!brand) {
        throw new NotFoundError(`No Brand with id: ${brandId} found`)
    }
    res.status(StatusCodes.OK).json({msg:'Deleted', brand })
})
const getBrand = asyncHandler(async(req, res) => {
    const {id: brandId} = req.params
    const brand = await Brand.findById({_id: brandId})
    if(!brand) {
        throw new NotFoundError(`No Brand with id: ${brandId} found`)
    }
    res.status(StatusCodes.OK).json({brand})

})
const getAllBrand = asyncHandler(async(req, res) => {
    const brand = await Brand.find()
    res.status(StatusCodes.OK).json({  brand})

})

module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    getBrand,
    getAllBrand

}