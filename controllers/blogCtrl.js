const User = require('../models/user')
const Blog = require('../models/blog')
const { NotFoundError } = require('../errors')
const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
const cloudinaryUploadImg = require('../utils/cloudinary')
const fs = require('fs')

const createBlog = asyncHandler(async(req, res) => {
    const blog = await Blog.create(req.body)
    res.status(StatusCodes.CREATED).json({blog})
})

const updateBlog = asyncHandler(async(req, res) => {
    const {id: blogId} = req.params
    const blog = await Blog.findByIdAndUpdate({_id:blogId}, req.body, { new: true})
    if(!blog) {
        throw new NotFoundError(`Blog with id: ${blogId} not found`)
    }
    res.status(StatusCodes.OK).json({msg: "Updated",blog})
})

const getABlog = asyncHandler(async(req, res) => {
    const {id: blogId} = req.params
    const blog = await Blog.findById({_id:blogId}).populate('likes').populate('dislikes')
    await Blog.findByIdAndUpdate({_id:blogId},
        {
            $inc: {numViews: 1}
        },
        {
            new: true
        })
    if(!blog) {
        throw new NotFoundError(`Blog with id: ${blogId} not found`)
    }
    res.status(StatusCodes.OK).json({blog})
})

const getAllBlog = asyncHandler(async(req, res) => {
    const blog = await Blog.find()
    res.status(StatusCodes.OK).json({blog})
})

const deleteBlog = asyncHandler(async(req, res) => {
    const {id: blogId} = req.params
    const blog = await Blog.findByIdAndDelete({_id:blogId})
    if(!blog) {
        throw new NotFoundError(`Blog with id: ${blogId} not found`)
    }
    res.status(StatusCodes.OK).json({msg: "Deleted",blog})
})

const likeBlog = asyncHandler(async(req, res) => {
    const {blogId} = req.body
    const blog = await Blog.findById(blogId)
    const loginUserId = req.user._id
    const isLiked = blog.isLiked
    const alreadyDisliked = blog.dislikes.find((userId) => userId.toString() === loginUserId.toString())
    if(alreadyDisliked){
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $pull: {dislikes: loginUserId},
                isDislike: false
            },
            {new: true}
            )
        return res.status(StatusCodes.OK).json(blog)
    }
    if(isLiked){
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $pull: {likes: loginUserId},
                isLiked: false
            },
            {new: true}
            )
        return res.status(StatusCodes.OK).json(blog)    
    } else {
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $push: {likes: loginUserId},
                isLiked: true
            },
            {new: true}
            )
        return res.status(StatusCodes.OK).json(blog)
    }
})
const dislikeBlog = asyncHandler(async(req, res) => {
    const {blogId} = req.body
    const blog = await Blog.findById(blogId)
    const loginUserId = req.user._id
    const isDislike = blog.isDislike
    const alreadyliked = blog.likes.find(
        (userId) => userId.toString() === loginUserId.toString()
    )
    if(alreadyliked){
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $pull: {likes: loginUserId},
                isLiked: false
            },
            {new: true}
            )
        return res.status(StatusCodes.OK).json(blog)
    }
    if(isDislike){
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $pull: {dislikes: loginUserId},
                isDislike: false
            },
            {new: true}
            )
        return res.status(StatusCodes.OK).json(blog)    
    } else {
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $push: {dislikes: loginUserId},
                isDislike: true
            },
            {new: true}
            )
        return res.status(StatusCodes.OK).json(blog)
    }
})

const uploadImages = asyncHandler(async(req, res) => {
    const {id:blogId} = req.params
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
    const findblog = await Blog.findByIdAndUpdate({_id: blogId},  {
        images: urls.map((file) => {
            return file
        })
    }, {
        new: true,
    })
    if(!findblog){
        throw new NotFoundError(`No product with id: ${blogIdId} found` )
    }
    res.status(StatusCodes.OK).json({findblog, msg: 'Blog image updated'})
})



module.exports = {
    createBlog,
    updateBlog,
    getABlog,
    getAllBlog,
    deleteBlog,
    likeBlog,
    dislikeBlog,
    uploadImages
}