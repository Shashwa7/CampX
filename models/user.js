//Using 3rd party authentication plugin : Passport

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportlocalMongoose = require('passport-local-mongoose')


const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
})

//this will add the pwd and username field by default
UserSchema.plugin(passportlocalMongoose)

module.exports = mongoose.model('User',UserSchema)