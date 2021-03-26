const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

//custom_thumbnail_url: https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/CampX/gxgle1ovzd2f3dgcpass.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});

//for fetching thumnail size images from cloudinary API
//so no matter how big is file it will be formated with the dimensions we provide
//in this case 200: width
//this will make faster fetch

//?this code will basically going to parse actual img urls to thumnail customized urls
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_250');
});
//* now we can access the property 'thumbnail' with 'images' obj 
//*note: data derived from virtual methods/property are not stored on mongo database. This amazing feature temporarily stores data.

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ ImageSchema ],
    geometry: {
        //GEO JSON Format
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            //! VVIMP note
            //! reverse the returned array of coordinates in order to locate proper location
            //! ret_cord = [y, x] => search_cord[x, y]
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

//For MAPBOX popup markup
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});


CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model('Campground', CampgroundSchema);