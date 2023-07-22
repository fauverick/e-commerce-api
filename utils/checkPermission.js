const CustomError = require('../errors')

const checkPermissions = (requestUser, resourceUserId) => { //requestUser is the loggedin user, resourceUserId is the id params of getSingleUser
    // console.log(requestUser);
    // console.log(resourceUserId);
    // console.log(typeof resourceUserId);
    if(requestUser.role === 'admin') {
        console.log("admin")
        return
    }; //if the user is admin, he can view data of all users
    if(requestUser.userId === resourceUserId.toString()) {
        console.log("confirmed");
        return;
    } //if the user is not admin, he can only view the data of his own
    throw new CustomError.UnauthorizedError('not ur place bitch')
}

module.exports = checkPermissions;