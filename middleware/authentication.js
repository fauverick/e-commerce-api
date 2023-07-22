const CustomError = require('../errors')
const {isTokenValid} = require('../utils')

const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies.token //see app.js for the .signedCookies and jwt.js for the .token
    if(!token){
        throw new CustomError.UnauthenticatedError('invalid authentication')
    }
    try {
        const {name, userId, role} = isTokenValid({token});
        req.user = {name, userId, role}; //attach the user to the req
        next();
    }
    catch (error){
        throw new CustomError.UnauthenticatedError('invalid authentication')
    }
}

const authorizePermission = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){ //check if the role in user is one of the authorized roles
            throw new CustomError.UnauthorizedError('unauthorized access to this route')
        }
        next();
    }
}

module.exports = {authenticateUser, authorizePermission}