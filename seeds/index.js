const mongoose = require('mongoose')
const Campground = require('../models/campground') //model

const { cities } = require('./cities')
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/campX-DB', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console,'Connection error: '))
db.once('open',() => console.log("Database Connected!"))

//func for randomize the combination from discriptor and places array
const extract_item = arr => arr[Math.floor(Math.random() * arr.length)]

const seedDB = async() => {
    await Campground.deleteMany({})

    for(let i = 0; i < 15; i++){
        const price = Math.floor(Math.random() * 20) + 10
        const randomOneLocOf1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground({
          author: '6057a6590424550df48cfe18',  
          title: `${extract_item(descriptors)} ${extract_item(places)}`,
          location: `${cities[randomOneLocOf1000].city}, ${cities[randomOneLocOf1000].state}`,
          //image: "https://source.unsplash.com/collection/20431456/1920x1080", //unsplash api
          description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores eaque itaque voluptas? Hic mollitia nisi tempore et id. At, debitis impedit doloremque incidunt officiis hic vitae amet pariatur! Quaerat, non.",
          price: price,
          images:[
            {
              url: 'https://res.cloudinary.com/s7-dev/image/upload/v1616698717/CampX_Imgs/hmjn1pan9llyf5qopfeg.jpg',
              filename: 'CampX_Imgs/hmjn1pan9llyf5qopfeg'
            },
            {
              url: 'https://res.cloudinary.com/s7-dev/image/upload/v1616698720/CampX_Imgs/a2khdnzyb9tqu3nubdys.jpg',
              filename: 'CampX_Imgs/a2khdnzyb9tqu3nubdys'
            }
          ]
        })
        await camp.save()
    }  
}

seedDB().then(() => {
    mongoose.connection.close()
})