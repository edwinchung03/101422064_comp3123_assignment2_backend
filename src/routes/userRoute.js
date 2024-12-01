// First, import all necessary libraries
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { body } = require('express-validator');
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/signup", [
  // validating errors with express-validator
  body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").isLength(6).withMessage("Password must have at least 6 characters")],
  async (req, res) => {
  // my requested bodies for /signup
  const { username, email, password } = req.body;
  
  try {
    // find if user email already exists
    let user = await User.findOne({ email });
    if (user) {
      // sample error response if user already exists
      return res.status(400).json({ 
        status: false,
        message: "User already exists" 
      });
    }

    // Process of hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    // add new user into the database with my datas
    user = new User({
      username,
      email,
      password: hashedPassword,
    });
  
    await user.save();

    // sample output
    return res.status(201).json({
      message: "User created successfully",
      user_id: user._id,
    });

  } catch (err) {
        
    // proper error messages for my code
    console.log(err.message);
    return res.status(500).send("Server error: check your console");
  }
});

router.post( "/login", [
  // validating errors with express-validator
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password must have at least 6 characters")],
  async (req, res) => {
  // email & password :  requested bodies
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    // if user doesn't exist
    if (!user) {
      return res.status(404).json({ 
        status: false,
        message: "User doesn't exist" 
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    // if email and password doesn't match
    if (!isMatch) {
      return res.status(400).json({ 
        status: false,
        message: "Invalid Password" 
      });
    }
    
    const payload = {
      user: {
        id: user.id,
        email: user.email,
      },
    };

    // for the jwt token
    jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      return res.status(200).json({
        message: "Login successful",
        jwt_token: token,
      });
    });

    } catch (err) {
      console.log(err.message);
      return res.status(500).send("Server error : check your console");
    }
});

module.exports = router;