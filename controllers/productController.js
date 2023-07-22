const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const path = require('path')

const createProduct = async(req, res) => {
    req.body.user = req.user.userId;  //in the product model we have the user in productSchema, the req.body.user refers to that. the req.user is always attached to every req through the cookies 
    //the other datas  except user (name, price, description...) in productSchema is input by the user
    const product = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({product})
}

const getAllProducts = async(req, res) => {
    console.log('all products')
    const products = await Product.find({})
    res.status(StatusCodes.OK).json({products, count: products.length})
}

const getSingleProduct = async(req, res) => {
    const {id: productId} = req.params;
    const product = await Product.findOne({_id: productId}).populate('reviews')
    if(!product){
        throw new CustomError.NotFoundError(`No product with id: ${productId}`)
    }
    res.status(StatusCodes.OK).json({product})
}

const updateProduct = async(req, res) => {
    const {id: productId} = req.params;
    const product = await Product.findOneAndUpdate({_id: productId}, req.body, {
        new: true,
        runValidators: true
    })

    if(!product){
        throw new CustomError.NotFoundError(`No product with id: ${productId}`)
    }
    res.status(StatusCodes.OK).json({product})
}

const deleteProduct = async(req, res) => {
    const {id: productId} = req.params;
    const product = await Product.findOne({_id: productId})

    if(!product){
        throw new CustomError.NotFoundError(`No product with id: ${productId}`)
    }

    await product.remove();
    res.status(StatusCodes.OK).json({msg: `Success! Product removed`})
}

const uploadImage = async(req, res) => {
    console.log('the file is ', req.files)
    if(!req.files){
        throw new CustomError.BadRequestError('No File Uploaded')
    }
    const productImage = req.files.image ; //see the uploadImage in Postman

    if(!productImage.mimetype.startsWith('image')){ //see the result for console.log(req.files) to see the mimetype
        throw new CustomError.BadRequestError('Please upload an image')
    }

    const maxSize = 1024 * 1024
    if(productImage.size > maxSize) {
        throw new CustomError.BadRequestError('Please upload an image smaller than 1mb')

    }

    const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`) //set up the path name for the image

    await productImage.mv(imagePath)
    res.status(StatusCodes.OK).json({image: `/uploads/${productImage.name}`})
}

module.exports = {createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, uploadImage}