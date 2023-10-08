const router = require('express').Router();
const userController = require('../controllers/userController')
const passport = require('../config/passport-setup');


// Route to handle user login
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/login-with-facebook', userController.facebookLogin);


router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route after successful Google login
router.get(
    '/auth/google/meatgram',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Generate the JWT token
      const token = req.user.generateJWT();
        const userId=req.user._id;
    res.redirect(`https://chersmeatgram.com/?token=${token}&userId=${userId}`);
    }
  );


module.exports = router
