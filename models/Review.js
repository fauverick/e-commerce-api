const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "please provide review title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      trim: true,
      required: [true, "please provide review title"],
      maxlength: 100,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true }); //each user can only leave one commment per product

ReviewSchema.statics.calculateAverageRating = async function (productId) {
  //use .statics instead of .methods like in User model, watch lesson 327 to understand the difference
  console.log(productId);
  const result = await this.aggregate([
    //redo the thing exported by aggregation pipeline on mongoDb,
    {
      $match: { product: productId }, //1st stage: filter out the product with the productId
    },
    {
      //2nd stage: to calculate the average rating and count the number of reviews
      $group: {
        _id: null, // group reviews by id, here we already filter out the product with the productId so _id: null or _id: "$product" also works
        //if we want to group by ratings, we set _id: "$rating" - then reviews with the same rating will belong to one group
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 5), //result[0] since result is an array with one element 
         //result[0]? to check if result[0] exist (if there's no reviews then result[0] wont exist)
        numOfReviews: result[0]?.numOfReviews || 0
      }
    );
  } catch (error) {}
  console.log(result);
};

//each time the review is saved - aka the review is updated, the code below is run
ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product); //in the Review Schema above, we have the product field to store product Id, this.product refers to this product Id
});

//each time the review is removed - aka the review is deleted, the code below is run
ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("review", ReviewSchema);
