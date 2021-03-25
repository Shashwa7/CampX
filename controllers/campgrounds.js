//model
const Campground = require('../models/campground') 
const { cloudinary } = require("../cloudinary");

//loads index page with all campgrounds
module.exports.index = async (req, res) => {  
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index',{ campgrounds })
}

//load form to add new campground
module.exports.renderNewForm = async(req,res) =>{
    res.render('campgrounds/insertCamp')
}

//look for specific campground
module.exports.showCampground  = async (req, res) => {
    const campground =  await Campground.findById(req.params.id)
    .populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    })
    .populate('author')
    if(!campground){
        req.flash('error','Cannot find the camppground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/showRoute',{ campground })
}

//crate new campground
module.exports.createCampground = async(req,res) => {
    
    const campground = new Campground(req.body.campground)
    campground.images = req.files.map(file => ({url: file.path, filename: file.filename})) //image details
    campground.author = req.user._id
 
    await campground.save() 
    console.log(campground)
    req.flash('success','Hurray! Successfully created new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
 }

 //loads up edit form
 module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/editCamp', { campground });
}

//updates edited campground
module.exports.updateCampground = async(req,res) =>{
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})

    const imgs = req.files.map(file => ({url: file.path, filename: file.filename})) //images in arr
    campground.images.push(...imgs) 
     //images as obj/enitities
     //! cuz we don't want to push array within an existing array

    await campground.save()

    //!deleting images
    if (req.body.deleteImages) {
        //!delete images from backend(cloudinary)
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        //!delete image URLs from our mongo database
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success','Hurray! Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
 }

 //delete campground
 module.exports.deleteCampground = async(req,res) =>{

    const { id } = req.params
     await Campground.findByIdAndDelete(id)
     req.flash('success','Successfully deleted campground!')
     res.redirect('/campgrounds')
 }