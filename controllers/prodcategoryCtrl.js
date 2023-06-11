const Category = require('../models/prodcategory')
const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
const { NotFoundError } = require('../errors')

const createCategory = asyncHandler(async(req, res) => {
    const category = await Category.create(req.body)
    res.status(StatusCodes.CREATED).json({msg: 'Created', category})

})

const updatecategory = asyncHandler(async(req, res) => {
    const {id: categoryId} = req.params
    const category = await Category.findByIdAndUpdate({_id: categoryId}, req.body, {
        new: true
    })
    if(!category) {
        throw new NotFoundError(`No category with id: ${categoryId} found`)
    }
    res.status(StatusCodes.OK).json({msg:'Updated', category })
})
const deleteCategory = asyncHandler(async(req, res) => {
    const {id: categoryId} = req.params
    const category = await Category.findByIdAndDelete({_id: categoryId})
    if(!category) {
        throw new NotFoundError(`No category with id: ${categoryId} found`)
    }
    res.status(StatusCodes.OK).json({msg:'Deleted', category })
})
const getCategory = asyncHandler(async(req, res) => {
    const {id: categoryId} = req.params
    const category = await Category.findById({_id: categoryId})
    if(!category) {
        throw new NotFoundError(`No category with id: ${categoryId} found`)
    }
    res.status(StatusCodes.OK).json({category})

})
const getAllCategory = asyncHandler(async(req, res) => {
    const category = await Category.find()
    res.status(StatusCodes.OK).json({  category})

})

module.exports = {
    createCategory,
    updatecategory,
    deleteCategory,
    getCategory,
    getAllCategory

}