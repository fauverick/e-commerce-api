const Order = require('../models/Order')
const Product = require('../models/Product')

const StatusCodes = require('http-status-codes')
const CustomError = require('../errors')
const {checkPermissions} = require('../utils')


const fakeStripeAPI = async({amount, currency}) => {
    const client_secret = "randomValue";
    return ({client_secret, amount})
}

const createOrder = async(req, res) => {
    const {tax, shippingFee} = req.body;
    const cartItems = req.body.items;

    if(!cartItems || cartItems.length < 1){
        throw new CustomError.BadRequestError('No cart item provided')
    }

    if(!tax || !shippingFee){
        throw new CustomError.BadRequestError('No tax or shipping fee  provided')
    }

    let orderItems = [];
    let subTotal = 0;

    for(const item of cartItems){
        const dbProduct = await Product.findOne({_id: item.product})
        if(!dbProduct){
            throw new CustomError.BadRequestError(`no product with id ${item.product} found`)

        }
        const {name, price, image, _id} = dbProduct
        console.log(name, price, image, _id);

        //construct order item from the sent back data 

        const singleOrderItem = {
            amount: item.amount,
            name, 
            price, 
            image,
            product: _id
        }

        //add item to order
        orderItems = [...orderItems, singleOrderItem];
        subTotal += item.amount * price;

    }
    const total = tax + shippingFee + subTotal;

    //get client secret
    const paymentIntent = await fakeStripeAPI({
        amount: total, 
        currency: 'usd'
    })

    const order = await Order.create({
        orderItems, 
        total, 
        subTotal,
        tax, 
        shippingFee, 
        clientSecret: paymentIntent.client_secret,
        user: req.user.userId
    })

    res.status(StatusCodes.CREATED).json({order, clientSecret: order.clientSecret})
}

const getAllOrders = async(req, res) => {
    const orders = await Order.find({});
    res.status(StatusCodes.OK).json({orders: orders, count: orders.length})
}

const getSingleOrder = async(req, res) => {
    const orderId = req.params.id;
    const order = await Order.findOne({_id: orderId});
    if(!orderId){
        throw new CustomError.BadRequestError(`no order with id ${orderId}`)
    }
    checkPermissions(req.user, order.user)

    res.status(StatusCodes.OK).json({order})
}

const getCurrentUserOrders = async(req, res) => {
    console.log(req.user.userId)
    const orders = await Order.find({user: req.user.userId});
    res.status(StatusCodes.OK).json({orders})
}


const updateOrder = async(req, res) => {
    const {paymentIntentId} = req.body;
    if(!paymentIntentId){
        throw new CustomError.BadRequestError('please provide payment intent id')
    }
    const orderId = req.params.id;
    const order = await Order.findOne({_id: orderId});
    if(!orderId){
        throw new CustomError.BadRequestError(`no order with id ${orderId}`)
    }

    checkPermissions(req.user, order.user)
    order.status = 'paid';
    order.paymentIntentId = paymentIntentId


    await order.save();
    res.status(StatusCodes.OK).json({order});

    // res.send("update order")
}


module.exports = {
    createOrder, getAllOrders, getSingleOrder, getCurrentUserOrders, updateOrder
}