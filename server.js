//require dotenv file to encode password
require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const methodOverride = require('method-override')

const app = express()
const port = 3000

const connStr = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@generalassembly.odxzs.mongodb.net`

const pageController = require('./controller/pages/page_controller')
const userController = require('./controller/users/users_controller')
const authorization = require('./middleware/authorization')

//set view engine
app.set('view engine', 'ejs')

// Apply middlewares
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(methodOverride('_method'))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: false, maxAge: 6000000}
  }))

//render home page that is not logged in
app.get('/', pageController.showHome)
app.get('/Signup', pageController.showSignUp)
app.get('/Signin', pageController.showSignIn)

// Use post method when user signs up
app.post('/signup', userController.signUp)

// Use post method when user sign in
app.post('/signin', userController.login)

//Get home loggedin page
app.get('/Home', authorization.Authenticated, (req, res) => {
    res.render('loggedIn/home')
})

//wishlist page
app.get('/Wishlist', authorization.Authenticated, (req, res) => {
    res.render('loggedIn/wishlist')
})

//update wishlist page
app.get('/Update', authorization.Authenticated, (req, res) => {
    res.render('loggedIn/update')
})

//Edit wishlist page
app.get('/Edit', authorization.Authenticated, (req, res) => {
    res.render('loggedIn/edit')
})

//logout route
app.delete('/logout', authorization.Authenticated, userController.logout)

//listening on port 
app.listen(port, async () => {
    try {
        await mongoose.connect(connStr, { dbName: 'RandomShop'})
    } catch(err) {
        console.log(err)
        console.log(`Failed to connect to DB`)
        process.exit(1)
    }
    console.log('Connected to DB')
    console.log(`Example app listening on port ${port}`)
})