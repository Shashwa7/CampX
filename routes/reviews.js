const express = require('express')
const router = express.Router({mergeParams: true}) 
// !Note:It is must to set 'mergeParams:true' ,so that we are able retrieve param value, as route prefix for this route contains params ':id' and router obj treats it differently than a regular express route. If not set we will retrieve null obj

const catchAsync = require('../utils/catchAsync');

//importing controllers
const reviews = require('../controllers/reviews')

//import review validation middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middlewares')

//Create Review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))
//Delete Review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(reviews.deleteReview))

module.exports = router