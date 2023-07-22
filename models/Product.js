const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'please provide name'],
        maxLenght: [100, 'name cannot be more than 100 characters']
    },
    price: {
        type: Number,
        default: 10
    },
    description: {
        type: String,
        required: [true, 'please provide description'],
        maxLenght: [1000, 'description cannot be more than 1000 characters']
    },
    image: {
        type: String,
        required: [true, 'please provide image'],
        default: '/uploads/example.jpg'
    },
    category: {
        type: String,
        required: [true, 'please provide product category'],
        enum: ['office', 'kitchen', 'bedroom'] //1st way to use enum, this is without the error message
    },
    company: {
        type: String,
        required: [true, 'please provide company'],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message: '{VALUE} is not provided'  //2nd way to use enum, this is with the error message
        }
    },
    colors: {
        type: [String],  //array of string
        default: ['#222'],
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    freeShipping: {
        type: Boolean,
        default: false
    },
    inventory: {
        type: Number,
        default: 15
    },
    averageRating: {
        type: Number,
        default: 5
    }, 
    numOfReviews: {
        type: Number,
        default: 0
    },
    user: {  //refer to the current logged in user
        type: mongoose.Types.ObjectId,  
        ref: 'User', //like in mongoose.model('User', userSchema)
        required: true
    }

},   { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

//setting the virtual connection between product schema and review schema, so that we can get all reviews of each product, another way is to setup the getSingleProductReviews in reviewController

ProductSchema.virtual('reviews', {
    ref: 'review',
    localField: '_id',
    foreignField: 'product',
    justOne: false,
    match: {rating: 5} //query only products with a rating of 5
  });

//deleting all reviews associated with a product when that product is deleted

ProductSchema.pre('remove', async function (next){
    await this.model('review').deleteMany({product: this._id})
})

module.exports = mongoose.model('product', ProductSchema);
