const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const {attachCookiesToResponse, createTokenUser} = require('../utils')
const jwt = require('jsonwebtoken')
const { token } = require('morgan')

const register = async(req, res) => {
    const {email, name, password} = req.body
    const emailAlreadyExist = await User.findOne({email})
    if(emailAlreadyExist){
        throw new CustomError.BadRequestError('email already in used')
    }

    //first registered user is admin
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount? "admin": "user"

    const user = await User.create({name, email, password, role});

   // const tokenUser = {name: user.name, userId: user._id, role: user.role} //the 3 infos that get sent 
    //back and passed through tokens are username, userId and role (DO NOT SEND THE PASSWORD)

    const tokenUser = createTokenUser(user)

    attachCookiesToResponse({res, user: tokenUser}) //we attach the token to cookies, that's why we pass the tokenUser instead of user
    res.status(StatusCodes.CREATED).json({user}) // this code is to send back the token that contains info about this user

}

const login = async(req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        throw new CustomError.BadRequestError('please provide email AND password')
    }
    const user = await User.findOne({email});

    if(!user){
        throw new CustomError.UnauthenticatedError('Email doesnt exist')
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Wrong password')
    }

    const tokenUser = {name: user.name, userId: user._id, role: user.role}
    attachCookiesToResponse({res, user: tokenUser})
    console.log('attaching to res')
    res.status(StatusCodes.CREATED).json({user: tokenUser}) // this code is to send back the token that contains info about this user


}

const logout = async(req, res) => {

    //logout means removing the cookies related to the current user - aka setting its value to 'logout
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()+ 5 * 1000) //the cookies expire (disappear) in 5 seconds, 
    })

    res.status(StatusCodes.OK).json({msg: 'user log out'})
}

module.exports = {register, login, logout}