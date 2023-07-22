const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please provide name'],
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'please provide email'],
        validate: {
            validator: validator.isEmail, //use this package instead of match like in jobster api
            msg: 'please provide a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'please provide password'],
        minlength: 6
    },
    role : {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
})


//hashing the password before we save the document (each time the document is changed - aka when updateUser or updateUserPassword is evoked)
UserSchema.pre('save', async function() { 
    console.log(this.isModified('password'), "changed")
    if(this.isModified('password')){ //only re-hashing the password when the password is modified
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    else {
        console.log("hi there")
        return;
    }
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}
module.exports = mongoose.model('user', UserSchema) //LOWERCASE FOR user otherwise populate in reviewController wont work