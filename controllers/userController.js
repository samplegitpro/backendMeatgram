// controllers/userController.js

const passport = require('../config/passport-setup');
const { User } = require('../models/userModel');

exports.registerUser = (req, res) => {
  const { name, email, password } = req.body;

  const newUser = new User({ name, email });

  console.log(newUser)
  const token = newUser.generateJWT();

  User.register(newUser, password, (err, user) => {
    if (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ error: err.message });
    }
    // Registration successful
    // console.log('Registration successful for user:', user);
    res.status(200).json({ 
        message: 'Registration successful' ,
        token,
        data:user,
        userId:user._id
    });
  });
};


exports.loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error('Authentication error:', err);
        return res.status(500).json({ error: 'Authentication error' });
      }
  
      if (!user) {
        console.error('Invalid credentials. Info:', info);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // If user found, login the user using 'req.logIn' method provided by Passport
      req.logIn(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ error: 'Login error' });
        }
  
        // If login is successful, respond with a success message or user details
        // console.log('Login successful for user:', user);
        const token = user.generateJWT();
        const userId = user._id;
        return res.status(200).json({ message: 'Login successful', userId,token });
      });
    })(req, res, next);
  };
  exports.facebookLogin = async (req, res) => {
    try {
      const { facebookId, name, email, accessToken } = req.body;
  
      console.log(email)
      if (!email) {
        return res.status(400).json({ error: 'Email is required for Facebook login' });
      }
  
      // Check if a user with the Facebook ID already exists in your database
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        // User with the Facebook ID already exists
        // You can update the user's information if necessary
        existingUser.name = name;
        // Add more fields as needed
  
        // Save the updated user
        const savedUser = await existingUser.save();
  
        // Generate a new JWT token for the user and send it in the response
        const token = savedUser.generateJWT();
        res.status(200).json({ token, userId: savedUser._id });
      } else {
        // User with the Facebook ID does not exist; create a new user
        const newUser = new User({
  
          name,
          email,
          // Add more fields as needed
        });
  
        // Save the new user
        const savedUser = await newUser.save();
  
        // Generate a new JWT token for the user and send it in the response
        const token = savedUser.generateJWT();
        res.status(200).json({ token, userId: savedUser._id });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  
  