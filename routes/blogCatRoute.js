const express = require('express')
const router = express.Router()

const { createCategory, updatecategory, deleteCategory, getCategory, getAllCategory } = require('../controllers/blogCatCtrl')
const isAdmin = require('../middleware/isAdmin')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/',authMiddleware, isAdmin, createCategory)
router.put('/:id', authMiddleware, isAdmin, updatecategory)
router.delete('/:id', authMiddleware, isAdmin, deleteCategory)
router.get('/',  getAllCategory)
router.get('/:id', getCategory)

module.exports = router