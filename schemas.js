
//SERVER SIDE VALIDATION
//JOI is 3rd party lib that helps us to easily implement all serverside validations.
//Validating data before updating or inserting any data to our db

const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html'); //for striping html tags from text(prevent XXS xlient side injection)

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

//creating JOI instance with the created instance
const Joi = BaseJoi.extend(extension)

//Campground schema
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array() 
})
// .required states that whole obj is required 

//Review Schema
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5), //rating counts/stars
        body: Joi.string().required().escapeHTML()
    }).required()
})