const express = require("express");
const router = express.Router();
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const User = require("../models/User"); // Adjust path as needed
require('dotenv').config();

const frontend_url = process.env.FRONTEND_URL;

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
const clientid = "228335856717-514r6qhk7fagdqufj3893c65qatmmmlh.apps.googleusercontent.com"
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
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"],prompt: "select_account" }));

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
    failureRedirect: `${frontend_url}/register`,  // Redirect on failure
}), (req, res) => {
    const { password, ...userWithoutPassword } = req.user;
    const user = userWithoutPassword._doc;
    const token = generateToken(user._id, user.isVerified);
    const userHasUsername = user.userName ? true : false;

    const response = {
        success: true,
        token: token,
        user: user,
        message: "Authentication successful",
        userHasUsername: userHasUsername,
    };

    res.send(`
        <script>
            window.opener.postMessage(${JSON.stringify(response)}, "${frontend_url}");
            window.close();
        </script>
    `);
});
  
  

module.exports = router;
