
//SERVER SIDE VALIDATION
//JOI is 3rd party lib that helps us to easily implement all serverside validations.
//Validating data before updating or inserting any data to our db

const Joi = require('joi');

//Campground schema
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
})
// .required states that whole obj is required 

//Review Schema
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5), //rating counts/stars
        body: Joi.string().required()
    }).required()
})