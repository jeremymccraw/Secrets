require('dotenv').config();
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

mongoose.connect(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);


app.get("/", function(req, res){
  res.render("home");
});

app.route("/login")
  .get(function(req, res){
  res.render("login");
  })
  .post(function(req, res){
    User.findOne({email: req.body.username}, function(err, foundUser){
      if (!foundUser){
        res.send("Incorrect username or password.  Register if this your first login.")
      } else {
        if (foundUser.password === req.body.password){
          res.render("secrets");
        } else {
          res.redirect("login");
        }
      }
    });
  });

app.route("/register")
  .get(function(req, res){
  res.render("register");
  })
  .post(function(req, res){
    const newUser = new User({
      email: req.body.username,
      password: req.body.password
    })
    newUser.save(function(err){
      if (!err){
        res.render("secrets")
      } else {
        res.send(err);
      }
    });
  });


app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
