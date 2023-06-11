const express = require('express')
const router = express.Router()

const { createBrand, updateBrand, deleteBrand, getBrand, getAllBrand } = require('../controllers/brandCtrl')
const isAdmin = require('../middleware/isAdmin')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/',authMiddleware, isAdmin, createBrand)
router.put('/:id', authMiddleware, isAdmin, updateBrand)
router.delete('/:id', authMiddleware, isAdmin, deleteBrand)
router.get('/',  getAllBrand)
router.get('/:id', getBrand)

module.exports = router