//Acessing dotenv file in our development environment
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError');
const methodoverride = require('method-override')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require("./models/user")
// IMPORTING ROUTES
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')
const userRoutes = require('./routes/user')

mongoose.connect('mongodb://localhost:27017/campX-DB', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false //no deprication warning now
})

const db = mongoose.connection
db.on('error', console.error.bind(console,'Connection error: '))
db.once('open',() => console.log("Database Connected!"))

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views',path.join(__dirname,'views'))


app.use(express.urlencoded({ extended: true })) //for parsing req body from form
app.use(methodoverride('_method')) // for overriding ususal form methods POST/GET with other alternatives like PUT/DELETE
app.use(express.static(path.join(__dirname,'public'))) //to be able to access our public dir


//Dummy session as of now
const sessionConfig = {
    secret: 'secretCode',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true, //prevents XSS scripting
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7, //expires week from now
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

//Middlewares
app.use(session(sessionConfig))
app.use(flash()) //for flashing mssg like alerts

//Passport authentication configuration
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

//Basically how to store and remove user in the session
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//locals/globals: used in every single template
app.use((req, res, next) => {                         
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})
//ROUTES
app.use('/',userRoutes)
app.use("/campgrounds",campgrounds)
app.use('/campgrounds/:id/reviews',reviews)

//Home Page
app.get('/', (req, res) => {
    res.render('campgrounds/home')
})


//ERROR HANDLING
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log("Serving on port 3000!")
})