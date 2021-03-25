//model
const User = require('../models/user')

//loads up user registeration form
module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

//register user
module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

//loads up login page
module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

//submits user login detail to server
module.exports.loginUser =  (req, res) => {

    //if everything goes right/ valid user
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo; 
    //*once the last url is retrieved, better delete the session which stored the url

    res.redirect(redirectUrl);
}

//logs out the user
module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
}