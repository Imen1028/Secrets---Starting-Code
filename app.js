//jshint esversion:6
import 'dotenv/config'
import express from "express"
import bodyParser from "body-parser"
import ejs from "ejs"
import axios from "axios"
import mongoose from "mongoose"
import encrypt from "mongoose-encryption"
import _ from "lodash-es"

console.log(process.env.SECRET)

const app = express()

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("Public"))

mongoose.connect("mongodb://0.0.0.0:27017/userDB")
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

// const encKey = "ZqPpnUlTA59+x7ZDFrcJ5lQGJZwTHYVNPHVq7CGa1J0="
// const sinKey = "S1vohQyotipK/A6VFX6Djs2EntEjceobEANYu8NrRoxX3pOtXAXzSrL8SA5T0anfl6k057GVhD+QmORSsyNNZA=="
// userSchema.plugin(encrypt, {encryptionKey: encKey, signingKey: sinKey, encryptedFields: ['password']})

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]})

const User = new mongoose.model("User", userSchema)

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
    res.render("secrets")
})

app.post("/register", async (req, res) => {
    try{
        const existUser = await User.findOne({email: req.body.username})
        if (existUser != null) {
            console.log("Email already registered.")
            res.redirect("/")
        } else {
            const user = new User({
                email: req.body.username,
                password: req.body.password
            })
            user.save()
            res.render("secrets")
        }
    } catch(err) {
        res.send(err.message)
    }
})

app.post("/login", async (req, res) => {
    try{
        const user = await User.findOne({
            email: req.body.username
        })
        console.log(user)
        if(user != null) {
            if (user.password === req.body.password) {
                res.render("secrets")
            } else {
                res.send("Wrong Password")
            }
        } else {
            res.send("User not found")
        }
    } catch(err) {
        res.send(err.message)
    }
})

app.listen(3000, () => {
    console.log("Server is running on port 3000.")
})