const express = require('express')
const router = express.Router()
const { createBlog, updateBlog, getABlog, getAllBlog, deleteBlog, likeBlog, dislikeBlog } = require('../controllers/blogCtrl')
const isAdmin = require('../middleware/isAdmin')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', authMiddleware, isAdmin,createBlog)
router.put('/likes',authMiddleware, likeBlog)
router.put('/dislikes',authMiddleware, dislikeBlog)
router.put('/:id', authMiddleware, isAdmin,updateBlog)

router.get('/:id', getABlog)
router.get('/', getAllBlog)

router.delete('/:id', authMiddleware, isAdmin,deleteBlog)

module.exports = router 