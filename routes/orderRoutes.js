const express = require('express')
const router = express.Router()

const { createOrder, getAllOrders, getSingleOrder, getCurrentUserOrders, updateOrder} = require('../controllers/orderController')
const {getSingleProductReviews} = require('../controllers/reviewController')
const {authenticateUser, authorizePermission} = require('../middleware/authentication')

router.route('/')
    .post(authenticateUser, createOrder)
    .get(authenticateUser, authorizePermission("admin"), getAllOrders);

router.route('/showAllMyOrders')
    .get(authenticateUser, getCurrentUserOrders)

router.route('/:id')
    .get(authenticateUser, getSingleOrder)
    .patch(authenticateUser, updateOrder)

module.exports = router;