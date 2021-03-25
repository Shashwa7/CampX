const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync');

//importing controllers
const campgrounds = require('../controllers/campgrounds')

// importing middlewares
const { isLoggedIn, validateCampground, isAuthor } = require('../middlewares') 

//cloudinary & multer: image upload libs
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage })

//home page & loggin 
//* Note: we can use 'route' method of obj 'router' to chain routes with similar paths
router.route('/')
      .get(catchAsync(campgrounds.index))
      .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

//opens up a campground form 
//only a logged in user can create a new campground 
router.get('/new', isLoggedIn, catchAsync(campgrounds.renderNewForm))

//create new campground
//* used isLoggedIn here just to avoid user to submit form from postman!

//! look/update/delete for a specific campground
//* Note: we can use 'route' method of obj 'router' to chain routes with similar paths 
router.route('/:id')
      .get(catchAsync(campgrounds.showCampground))
      .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
      .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
 
module.exports = router

