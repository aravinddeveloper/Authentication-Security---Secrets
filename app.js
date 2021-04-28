//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
//const encrypt = require('mongoose-encryption');
//const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

console.log(process.env.SECRET);

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect('mongodb://localhost:27017/userDB',{useNewUrlParser:true});

const userSchema = new mongoose.Schema({
  email:String,
  password:String
});


//userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});

const user = new mongoose.model('User',userSchema);

app.get('/',function(req,res){
  res.render('home');
});

app.get('/login',function(req,res){
  res.render('login');
});

app.get('/register',function(req,res){
  res.render('register');
});

app.post('/register',function(req,res){
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new user({
      email:req.body.username,
      //password:md5(req.body.password)
      password:hash
    });
    newUser.save(function(err){
      if (!err){
        console.log('User added successfully');
        res.render('secrets');
      }
    });
  });
});

app.post('/login',function(req,res){
  const userLogged = req.body.username;
  //const pwdLogged = md5(req.body.password);
  const pwdLogged = req.body.password;
  user.findOne({email:userLogged},function(err,foundUser){
    if (err){
      console.log(err);
    }else {
      if (foundUser){
        bcrypt.compare(pwdLogged, foundUser.password, function(err, result) {
          if (result==true){
            console.log('User logged in successfully');
            res.render('secrets');
          }
        });
        //if (foundUser.password===pwdLogged){
        //  console.log('User logged in successfully');
        //  res.render('secrets');
        //}
        //else {
          //console.log('wrong password');
          //res.redirect('/login');
        //}
      }else {
        console.log('Username does not match');
        res.redirect('/login');
      }
    }
  });
});

app.listen(3000,function(){
  console.log("server started on port 3000");
});
