const Review = require('../models/Review')
const Product = require('../models/Product')

const StatusCodes = require('http-status-codes')
const CustomError = require('../errors')
const {checkPermissions} = require('../utils')


const createReview = async (req, res) => {
    console.log("create ", req.user);
    const {product: productId} = req.body;
    const isValidProduct = await Product.findOne({_id: productId});
    if(!isValidProduct){
        throw new CustomError.NotFoundError(`no product with id ${productId}`)
    }
    const alreadySubmitted = await Review.findOne({ //check if the user has already submmited a review for this product
        product: productId,
        user: req.user.userId
    })


    if(alreadySubmitted){
        throw new CustomError.BadRequestError(
            'Already submitted review for this product '
        )
    }

    req.body.user = req.user.userId
    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({review})
}

const getAllReviews = async (req, res) => {
    // const reviews = await Review.find({}).populate({path: 'product', select: 'name company price'})
    const reviews = await Review.find({}) //LOWERCASE the schema name when export schema in models ('user', 'product') (watch lesson 323 on Udemy)
    .populate({  //originally, without the populate the .product and .user in response contains only the productId and the userId, with populate we can add the name company price...
        path: 'product',
        select: 'name company price',
      })
    .populate({
        path:'user',
        select: 'name'
    });


    res.status(StatusCodes.OK).json({reviews})
}

const getSingleReview = async (req, res) => {
    console.log("single ", req.user);
    const review = await Review.findOne({_id: req.params.id})
    if(!review){
        throw new CustomError.NotFoundError(`no review with id ${req.params.id}`)
    }
    res.status(StatusCodes.OK).json({review})
}



const updateReview = async (req, res) => {
    const reviewId = req.params.id;
    const {rating, title, comment} = req.body;
    const review = await Review.findOne({_id: reviewId})

    if(!review){
        throw new CustomError.NotFoundError(`no review ith id ${reviewId}`)
    }

    checkPermissions(req.user, review.user)

    review.rating = rating;
    review.title = title;
    review.comment = comment;

    await review.save();
    res.status(200).json({review})


}


const deleteReview = async (req, res) => {
    console.log(req.user);
    const reviewId = req.params.id;
    const review = await Review.findOne({_id: reviewId})
    console.log(req.user, review.user)
    if(!review){
        throw new CustomError.NotFoundError(`no review ith id ${reviewId}`)
    }
    checkPermissions(req.user, review.user)
  
    await review.remove()

    res.status(200).json("removed")
}


const getSingleProductReviews = async (req, res) => {
    const productId = req.params.id;
    const reviews = await Review.find({product: productId})
    res.status(StatusCodes.OK).json({reviews, count: reviews.length})
}


module.exports = {createReview, getAllReviews, getSingleReview, updateReview, deleteReview, getSingleProductReviews}