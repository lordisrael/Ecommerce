const express = require('express')
const router = express.Router()

const { createProduct, getAllProduct, getAProduct, updateProduct, deleteProduct, addToWishlist, rating, uploadImages } = require('../controllers/productsCtrl')
const isAdmin= require('../middleware/isAdmin')
const auth = require('../middleware/authMiddleware')
const { uploadPhoto, productImgResize } = require('../middleware/uploadImageMiddleware')


router.post('/',auth, isAdmin,createProduct)
router.put('/wishlist', auth, addToWishlist)
router.put('/rating', auth, rating)
router.put('/upload/:id', auth, isAdmin, uploadPhoto.array("images", 10), productImgResize, uploadImages)
router.get('/', getAllProduct)
router.get('/:id', getAProduct)
router.put('/:id',auth, isAdmin,updateProduct)
router.delete('/:id',auth, isAdmin, deleteProduct)

module.exports = router