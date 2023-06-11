const Product = require('../models/products')
const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')
const cloudinaryUploadImg = require('../utils/cloudinary')
const {BadRequestError, NotFoundError} = require('../errors')
const user = require('../models/user')

const createProduct = asyncHandler(async(req, res) => {
    if(req.body.title){
        req.body.slug = slugify(req.body.title)
    }
    const product = await Product.create(req.body)
    if(!product){
        throw new BadRequestError(' Fill all information')
    }
    res.status(StatusCodes.OK).json({product, msg: 'Product created'})

})

const updateProduct = asyncHandler(async(req, res) => {
    const { id: productId } = req.params
    if(req.body.title){
        req.body.slug = slugify(req.body.title)
    }
    const product = await Product.findOneAndUpdate({_id: productId}, req.body,
         {
        new: true,
    })
    if(!product){
        throw new NotFoundError(`No product with id: ${productId} found` )
    }
    res.status(StatusCodes.OK).json({product, msg: 'Product updated'})
})

const deleteProduct = asyncHandler(async(req, res) => {
    const { id: productId } = req.params
    const product = await Product.findByIdAndDelete({_id: productId})
    if(!product){
        throw new NotFoundError(`No product with id: ${productId} found` )
    }
    res.status(StatusCodes.OK).json({msg: 'Product deleted'})
})

const getAProduct = asyncHandler(async(req, res) => {
    const { id: productId } = req.params
    const product = await Product.findById({_id: productId})
    if(!product){
        throw new NotFoundError(`No product with id: ${productId} found` )
    }
    res.status(StatusCodes.OK).json({product})
}) 

const getAllProduct = asyncHandler(async(req, res) => {
    const { category, brand, title, numericFilters, sort, fields } = req.query
    const queryObject = {}
    if(category){
        queryObject.category = category
    }
    if(brand){
        queryObject.brand = brand
    }
    if(title){
        queryObject.title = {$regex: title, $options: 'i'}
    }
    if(numericFilters){
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            "<=": '$lte'
        }
        const regEx = /\b(<|>|>=|=|<|<=)\b/g
        let filters = numericFilters.replace(regEx,(match) => `${operatorMap[match]}-`
        )
        const options = ['price', 'ratings']
        filters = filters.split(',').forEach((item) => {
            const [field, operator, value] = item.split('-')
            if(options.includes(field)){
                queryObject[field] = {[operator]: Number(value)}
            }
        })
    }
    let result = Product.find(queryObject)
    if(sort){
        const sortList = sort.split(',').join(' ')
        result = result.sort(sortList)
    } else {
        result = result.sort('createdAt')
    }
    if(fields){
        const fieldsList = fields.split(',').join(' ')
        result = result.select(fieldsList)
    } else {
        result = result.select('-__v')
    }
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 2
    const skip = (page - 1) * limit
    if(page) {
        const prodCount = await Product.countDocuments()
        if(skip >= prodCount) throw new NotFoundError('Page does not exist')
    }

    result = result.skip(skip).limit(limit)


    const products = await result.select('title _id price -createdAt -sold -updatedAt')
    
    //const products = await Product.find()
    res.status(StatusCodes.OK).json({products, nbHits: products.length})
})

const addToWishlist = asyncHandler(async(req, res) => {
    const {_id} = req.user
    const {productId} = req.body
    const user = await User.findById(_id)
    const alreadyadded =await  user.wishlist.find((id) => id.toString() === productId)
    if(alreadyadded) {
        let user =await  User.findByIdAndUpdate(_id, {
            $pull: {wishlist: productId}
        },
        {
            new: true
        })
        return res.status(StatusCodes.OK).json(user)
    } else {
        let user =await  User.findByIdAndUpdate(_id, {
            $push: {wishlist: productId}
        },
        {
            new: true
        })
        return res.status(StatusCodes.OK).json(user)

    }
})

const rating = asyncHandler(async (req, res) => {
    const {_id} = req.user
    const { star ,productId,comment} = req.body
    const product = await  Product.findById(productId)
    let alreadyrated = product.ratings.find((userId) => userId.postedBy.toString() === _id.toString() )
    if(alreadyrated) {
        const updateRating = await Product.updateOne({
            ratings:{ $elemMatch: alreadyrated}
        },{
            $set: {"ratings.$.star": star, "ratings.$.comment": comment}
        },{
            new: true
        })
    } else {
        const rateProduct = await Product.findByIdAndUpdate(productId, {
            $push: {
                ratings: {
                    star: star,
                    comment: comment,
                    postedBy: _id 
                },
            },

        }, {
            new: true
        })
    }
    const getallratings = await Product.findById(productId)
    let totalrating = getallratings.ratings.length
    let ratingsum = getallratings.ratings.map((item) => item.star).reduce((prev, curr) => prev+curr, 0)
    let actualrating = Math.round(ratingsum/totalrating)
    let finalproduct = await Product.findByIdAndUpdate(productId, {
        totalrating: actualrating
    }, {
        new: true
    })
    return res.status(StatusCodes.OK).json(finalproduct)
})

const uploadImages = asyncHandler(async(req, res) => {
    const {id:productId} = req.params
    console.log(req.files)
    const uploader = (path) => cloudinaryUploadImg(path, "images")
    const urls = []
    const files = req.files
    for (const file of files) {
        const {path} = file
        const newpath = await uploader(path)
        console.log(newpath)
        urls.push(newpath)
    }
    const findproduct = await Product.findByIdAndUpdate({_id: productId},  {
        images: urls.map((file) => {
            return file
        })
    }, {
        new: true,
    })
    if(!findproduct){
        throw new NotFoundError(`No product with id: ${productId} found` )
    }
    res.status(StatusCodes.OK).json({findproduct, msg: 'Product image updated'})
})

module.exports = {
    createProduct,
    getAProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImages
}