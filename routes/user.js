const express = require('express')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')

//controller
const users  = require('../controllers/users')

//* Note: we can use 'route' method of obj 'router' to chain routes with similar paths
router.route('/register')
      .get(users.renderRegisterForm) //loads up register form
      .post(catchAsync(users.registerUser)) //registers/creates user

/* --- LOGIN / LOGOUT ---
? what does - passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' } means?
!: incase of invalid login attempt passport authenticate will triiger the failure message flash and will redirect the user to the login page
*:  but incase of valid login attempt it will execute code withing the scope
*/
router.route('/login')
      .get(users.renderLoginForm) //loads up login form
      .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser) //logs user in

//Logout
router.get('/logout', users.logoutUser)

module.exports = router
/*
Users created so far:

1> un: hugo21, pwd: hugo247
2> un: mario7, pwd: mario247
3> un: shashwa7, pwd: shashwa247
*/