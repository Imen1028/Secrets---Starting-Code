//jshint esversion:6
import 'dotenv/config'
import express from "express"
import bodyParser from "body-parser"
import ejs from "ejs"
import axios from "axios"
import mongoose from "mongoose"
import _ from "lodash-es"
import session from "express-session"
import passport from "passport" // Doc: https://www.passportjs.org/concepts/authentication/
import passportLocalMongoose from "passport-local-mongoose"

const app = express()

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("Public"))

app.use(session({
    secret: process.env.SECRET,
    name: 'user', // optional
    saveUninitialized: false,
    resave: false, 
  }))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://0.0.0.0:27017/userDB")
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("User", userSchema)

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets")
    }else {
        res.redirect("/login")
    }
})

app.get("/logout", (req,res) => {
    req.logout((err) => { // logout now requires a callback function https://stackoverflow.com/questions/72336177/error-reqlogout-requires-a-callback-function
        if (err) {
            res.send(err.message)
        }
    })
    res.redirect("/")
})

app.post("/register", (req, res) => {

    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if(err) {
            console.log(err)
            res.redirect("/register")
        } else {
            passport.authenticate("local")
            (req, res, () => { //How does it work???
                res.redirect("/secrets")
            })
        }
    })
})

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, (err) => {
        if(err) {
            console.log(err)
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets")
            })
        }
    })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000.")
})