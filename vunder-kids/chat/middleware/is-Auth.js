//  This Middleware is created by Vikrant 
//  For Auth
var jwt = require("jsonwebtoken");
require('dotenv').config();

const isAuth=async (req,res,next)=>{
    try {
        let token=req.header("token")
        if(!token){
            return res.send("Token Is Not Correct");
        }
        const data = jwt.verify(token,process.env.JWT_SECRET);

        //commented for purpose of testing
        // if (!data.isVerified) {
        //     return res.status(403).json({ error: "Email not verified" });
        // }

        // { user: { id: '64b0873ba5029152669bd531' , isVerified:true }, iat: 1689290555 }
        req.user = data;

        next();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const optionalAuth = async (req,res,next)=>{
    try {
        let token=req.header("token")
        if(!token){
            return next();
        }
        const data = jwt.verify(token,process.env.JWT_SECRET);

        // { user: { id: '64b0873ba5029152669bd531' }, iat: 1689290555 }
        req.user = data;
        console.log("this is the user id "+ data.req.user.id);
        next();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
module.exports={isAuth,optionalAuth};
