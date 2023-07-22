const User = require('../models/User')
const StatusCodes = require('http-status-codes')
const CustomError = require('../errors')
const {createTokenUser, attachCookiesToResponse, checkPermissions} = require('../utils')

const getAllUsers = async(req, res) => {
    console.log(req.user) //the user is attached to req during /middleware/authentication
    const allUser = await User.find({role: 'user'}).select('-password') //exclude the password from being returned
    res.status(StatusCodes.OK).json({users: allUser})
}

const getSingleUser = async(req, res) => {
    const user = await User.findOne({_id: req.params.id}).select('-password')
    if(!user){
        throw new CustomError.NotFoundError(`no user with id ${req.params.id}`)
    }

    checkPermissions(req.user, user._id)
    res.status(StatusCodes.OK).json({user: user})
}
const showCurrentUser = async(req, res) => {
    res.status(StatusCodes.OK).json({currentUser: req.user})
}

//update user with user.save()
const updateUser = async(req, res) => {
    const {name, email} = req.body;
    if(!name || !email){
        throw new CustomError.BadRequestError('please provide name and email')
    }

    const user = await User.findOne({ _id: req.user.userId });

    user.email = email;
    user.name = name;
  
    console.log(user)

    const tokenUser = createTokenUser(user);

    await user.save()

    res.status(StatusCodes.OK).json({tokenUser})
}

const updateUserPassword = async(req, res) => {
    const {oldPassword, newPassword} = req.body;
    if(!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError('please provide old and new password')
    }
    const user = await User.findOne({_id: req.user.userId})
    const isPasswordCorrect = await user.comparePassword(oldPassword) //compare the old password from the user's input to the one in the database
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('invalid credentials')
    }
    user.password = newPassword;

    await user.save()
    res.status(StatusCodes.OK).json({msg: 'password updated'})
}

module.exports = {getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword}