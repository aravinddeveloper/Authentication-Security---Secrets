//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
var session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

console.log(process.env.SECRET);

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret: 'our little secret.',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB',{useNewUrlParser:true});
mongoose.set('useCreateIndex',true);

const userSchema = new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});

const user = new mongoose.model('User',userSchema);

passport.use(user.createStrategy());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get('/',function(req,res){
  res.render('home');
});

app.get('/login',function(req,res){
  res.render('login');
});

app.get('/register',function(req,res){
  res.render('register');
});

app.get('/secrets',function(req,res){
  if (req.isAuthenticated()){
    res.render('secrets');
  }else {
    res.redirect('/login');
  }
});

app.post('/register',function(req,res){
  user.register({username:req.body.username},req.body.password,function(err,newUser){
    if (err){
      console.log(err);
      res.redirect('/register')
    }else {
      passport.authenticate('local')(req,res,function(){
        res.redirect('/secrets');
      });
    }
  });
});

app.post('/login',function(req,res){
  const loginUser = new user({
    email:req.body.username,
    password:req.body.password
  });
  req.login(loginUser,function(err){
    if (err){
      console.log(err);
    }else {
      passport.authenticate('local')(req,res,function(){
        res.redirect('/secrets');
      });
    }
  })
});

app.listen(3000,function(){
  console.log("server started on port 3000");
});
