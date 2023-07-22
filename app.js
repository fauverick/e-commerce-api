require ('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()

const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')

//initiate security packages 
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanatize = require('express-mongo-sanitize')

const connectDB = require('./db/connect')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const orderRoutes = require('./routes/orderRoutes')


//middleware
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

//setup security packages
app.set('trust proxy', 1)
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60
}))
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanatize())



app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.static('./public')) //make a folder accesible to the public, this time the public folder is used to store image uploads, other time it's for frontend use
app.use(fileUpload())


app.get('/', (req, res) => {
    res.send('hi there mtfk. this is e-commerce')
})


app.get('/api/v1', (req, res) => {
    console.log(req.signedCookies) //REMEMBER: access it by req.signedCookies instead of req.cookies
    res.send(' e-commerce api')
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/orders', orderRoutes)




app.use(notFoundMiddleware) //THE ORDER IS IMPORTANT, NOT FOUND MUST BE PLACED BEFORE ERRORHANDLER because errorhandler only works with existing route, if a route does not exist it needs to run through the notfound middleware first
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 4500;

const start = async () => {
    try{
        await connectDB(process.env.MONGO_URI)
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        })
    }
    catch (err) {
        console.log(err)
    }
}

start()