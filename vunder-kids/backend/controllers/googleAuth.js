const express = require("express");
const router = express.Router();
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const User = require("../models/User"); // Adjust path as needed

// Jwt Token Work
var jwt = require("jsonwebtoken");
//  add this in the env file
const jwt_word =  process.env.JWT_SECRET;


//  For the Unique Name
const { v4: uuidv4 } = require('uuid');
// Middleware to generate unique username
const generateUniqueUserName = (displayName) => {
    const shortUuid = uuidv4().split('-')[0];
    return `${displayName}-${shortUuid}`;
};
const generateToken = (id, isVerified) => {
    return jwt.sign({ id, isVerified }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
  };
// Setup session middleware
router.use(session({
    secret: "YOUR_SECRET_KEY", 
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport middleware
router.use(passport.initialize());
router.use(passport.session());

//  be carefull here
const clientid = "729476198678-i5ctoo7m4otders01mappbrr5al07uj5.apps.googleusercontent.com"
const clientsecret = "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"

passport.use(new OAuth2Strategy({
        clientID: clientid,
        clientSecret: clientsecret,
        callbackURL: "/api/auth/google/callback",
        scope: ["profile", "email"]
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            // console.log(user);
            if (!user) {
                const userName = generateUniqueUserName(profile.displayName);
                user = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    isGoogleUser:true,
                    isVerified:true
                    // image: profile.photos[0].value
                });
         

                await user.save();
            }
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

// Serialize and Deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id); // Assuming Mongoose ObjectId
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Initial Google OAuth login route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback route

//  two ways to do this
// 1. redirect way
// router.get("/google/callback", passport.authenticate("google", {
//     failureRedirect: "http://localhost:3000" // Redirect to login page on failure
// }), (req, res) => {
//     let data = {
//                 user: {
//                   id: req.user.id,
//                 },  
//               };
        
//             const token = jwt.sign(data, jwt_word);
//     // Successful authentication
//     // res.redirect("http://localhost:3000/home"); // Redirect to dashboard or appropriate route
//     res.redirect(`http://localhost:3000/register/about`);
// });

//  2. my way Here i am sending the user
// Google OAuth callback
router.get("/google/callback", passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/register",  // Redirect on failure
}), (req, res) => {
    // Remove password from the user object
    const { password, ...userWithoutPassword } = req.user;

    // Check the user data in the '_doc' property
    const user = userWithoutPassword._doc;

    // Create the JWT token
    const token = generateToken(user._id, user.isVerified);

    // Check if the user has a username
    const userHasUsername = user.userName ? true : false;

    // Send the response with the token and user data
    const response = {
        success: true,
        token: token,
        user: user,  // Sending the user object without the password
        message: "Authentication successful",
        userHasUsername: userHasUsername,  // Add a flag to indicate if username exists
    };

    // Instead of redirecting, send a message to the OAuth window
    res.send(`
        <script>
            window.opener.postMessage(${JSON.stringify(response)}, "http://localhost:3000");
            window.close();
        </script>
    `);
});

  
  

module.exports = router;
