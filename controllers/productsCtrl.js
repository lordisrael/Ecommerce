const Product = require('../models/products')
const User = require('../models/user')
const Cart = require('../models/cart')
const Coupon = require('../models/coupon')
const Order = require('../models/order')
const uniqid = require('uniqid')
const { StatusCodes } = require('http-status-codes')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')
const cloudinaryUploadImg = require('../utils/cloudinary')
const {BadRequestError, NotFoundError} = require('../errors')
const user = require('../models/user')
const fs = require('fs')
const path = require('path')

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
        }).select('-refreshToken')
        return res.status(StatusCodes.OK).json(user)
    } else {
        let user =await  User.findByIdAndUpdate(_id, {
            $push: {wishlist: productId}
        },
        {
            new: true
        }).select('-refreshToken')
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
    //console.log(req.files)
    const uploader = (path) => cloudinaryUploadImg(path, "images")
    const urls = []
    const files = req.files
    for (const file of files) {
        const {path} = file
        const newpath = await uploader(path)
        //console.log(newpath)
        urls.push(newpath)
        //fs.unlinkSync(path)
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

const userCart = asyncHandler(async(req, res) => {
    const {cart} = req.body
    const {_id} = req.user
    let products = []
    const user = await User.findById(_id)
    const alreadyExistCart = await Cart.findOne({orderby: user._id})
    if(alreadyExistCart) {
        alreadyExistCart.remove()
    }
    for(let i = 0; i < cart.length; i++) {
        let object = {}
        object.product = cart[i]._id
        object.count = cart[i].count
        object.color = cart[i].color
        let getPrice = await Product.findById(cart[i]._id).select('price').exec()
        object.price = getPrice.price
        products.push(object )

    }
    let cartTotal = 0
    for(let i = 0; i < products.length; i++){
        cartTotal = cartTotal + products[i].price * products[i].count
    }
    let newCart = await new Cart({
        products,
        cartTotal,
        orderby: user._id
    }).save()
    res.status(StatusCodes.OK).json(newCart)
})

const getUserCart = asyncHandler(async(req, res) => {
    const {_id} = req.user
    const cart = await Cart.findOne({orderby:_id}).populate("products.product", "_id title price totalAfterDiscount")
    res.status(StatusCodes.OK).json(cart)
})

const emptyCart = asyncHandler(async(req, res) => {
    const { _id } = req.user
    const user = await User.findOne({ _id })
    const cart = await Cart.findOneAndRemove({orderby: user._id})
    res.status(StatusCodes.OK).json(cart)
})

const applyCoupon = asyncHandler(async(req, res) => {
    const {coupon} = req.body
    const {_id} = req.user
    const validCoupon = await Coupon.findOne({name: coupon})
    if(validCoupon === null) {
        throw new NotFoundError('Coupon not Found')
    }
    const user = await User.findOne({_id})
    let { cartTotal} = await Cart.findOne({orderby: user._id,}).populate("products.product")
    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount)/ 100).toFixed(2)
    await Cart.findOneAndUpdate(
        {orderby: user._id},
        {totalAfterDiscount},
        {new: true}
    )
    res.status(StatusCodes.OK).json(totalAfterDiscount)

})

const createOrder = asyncHandler(async(req, res) => {
    const { COD, couponApplied} = req.body
    const {_id} = req.user
    if(!COD) throw new NotFoundError("Create cash order failed")
    const user = await User.findById({_id})
    let userCart = await Cart.findOne({orderby: user._id})
    let finalAmount = 0
    if(couponApplied && userCart.totalAfterDiscount) {
        finalAmount = userCart.totalAfterDiscount * 100
    } else {
        finalAmount = userCart.cartTotal * 100
    }

    let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
            id: uniqid(),
            method: "COD",
            amount: finalAmount,
            status: "Cash on delivery",
            created: Date.now(),
            currency: 'usd'
        },
        orderby: user._id,
        orderStatus: "Cash on delivery"
    }).save()
    let update = userCart.products.map((item) => {
        return{
            updateOne: {
                filter: {_id: item.product._id},
                update: {$inc: {quantity: -item.count, sold: +item.count}}
            },
        }
    })
    const updated = await Product.bulkWrite(update, {})
    res.status(StatusCodes.OK).json("Success")
})

const getOrder = asyncHandler(async(req, res) => {
    const { _id } = req.user
    //console.log(req.user)
    //const user = await User.findOne({ _id })
    const userOrders = await Order.findOne({ orderby: _id}).populate("products.product").exec()
    if(!userOrders) {
        throw new NotFoundError(`No order found` )
    }
    res.status(StatusCodes.OK).json(userOrders)
})

const updateOrderStatus = asyncHandler(async(req, res) => {
    const {status} = req.body
    const {id: orderId} = req.params
    const updateOrderStatus = await Order.findByIdAndUpdate({_id: orderId},
        {
            orderStatus: status,
            paymentIntent: {
                status: status
            },   
        }, { new: true})
        res.status(StatusCodes.OK).json(updateOrderStatus)
})

module.exports = {
    createProduct,
    getAProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImages,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrder, 
    updateOrderStatus
}