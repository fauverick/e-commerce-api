const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const StatusCodes = require('http-status-codes')

const createJWT = ({payload}) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME
    })
    return token;  //REMEMBER TO RETURN THE GOD DAMN TOKEN
}

const isTokenValid = ({token}) => jwt.verify(token, process.env.JWT_SECRET) //decode the token into name, UserId and role

const attachCookiesToResponse = ({res, user}) => {
    const token = createJWT({payload: user})

    const oneDay = 1000 * 60 * 60 * 24 //the number of ms in a day
    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
        signed : true,
    })

}

module.exports = {createJWT, isTokenValid, attachCookiesToResponse}