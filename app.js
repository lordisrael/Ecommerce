require('dotenv').config()
require('express-async-errors')
const cookieParser = require('cookie-parser')
const express = require('express')
const morgan = require('morgan')

const app = express()

//const fileUpload = require('express-fileupload');

const notFoundMiddleware = require('./middleware/not-Found')
const errorHandlerMiddleware = require('./middleware/error-handler')
const authRoute = require('./routes/authRoute')
const productRoute = require('./routes/productRoute')
const blogRoute = require('./routes/blogRoute')
const prodcategoryRoute = require('./routes/prodcategoryRoute')
const blogCatRoute = require('./routes/blogCatRoute')
const brandRoute = require('./routes/brandRoute')
const couponRoute = require('./routes/couponRoute')

const dbConnect = require('./config/dbConnect')

app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())
//app.use(fileUpload({ useTempFiles: true }));

app.use('/api/v1/auth', authRoute)
app.use('/api/v1/product', productRoute)
app.use('/api/v1/blog', blogRoute)
app.use('/api/v1/blogcategory', blogCatRoute)
app.use('/api/v1/brand', brandRoute)
app.use('/api/v1/category', prodcategoryRoute)
app.use('/api/v1/coupon', couponRoute)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000

const start =  async () => {
    try {
        await dbConnect(process.env.MONGO_URI)
        app.listen(port, () => {
            console.log(`Server is listening on port ${port} `)
        })

    } catch (error) {
        console.log(err.stack)
    }
}
start()
