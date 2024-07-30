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

        // { user: { id: '64b0873ba5029152669bd531' }, iat: 1689290555 }
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
            next();
        }
        const data = jwt.verify(token,process.env.JWT_SECRET);

        // { user: { id: '64b0873ba5029152669bd531' }, iat: 1689290555 }
        req.user = data;
        next();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
module.exports={isAuth,optionalAuth};
