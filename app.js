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
const mongoSanitize = require('express-mongo-sanitize') //to prevent sql/mongo injection
const helmet = require('helmet') //for manipulating headers

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
app.use(mongoSanitize({
    replaceWith: '_'
})) // prevent SQL/Mongo Injection


//Dummy session as of now
const sessionConfig = {
    name:'trexsession',
    secret: 'secretCode',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true, //prevents XSS scripting
        // secure: true, //!uncomment this while deploying
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7, //expires week from now
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

//Middlewares
app.use(session(sessionConfig))
app.use(flash()) //for flashing mssg like alerts

//HELMET: Header Maipulation
app.use(helmet()); //this enable all middleware that comes with helmet
//helmet() contains a 'Content restrictive policy' which will not allow our app to iteract with any endpoint outside its domain
//? If you want to iteract with 3rd part domain you have 2 methods:
//* M1> set helmet({contentSecurityPolicy: false})
//* M2>Explicitly declare sites/3rd party URLs/Endpoints/ sources that our app wants to interact with 

//* Using M2: all these sites are allowed to interact with our app, more like whitelisting these sites
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
const cloudinary_galler_id = 's7-dev'
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${cloudinary_galler_id}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://images.pexels.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
); 


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