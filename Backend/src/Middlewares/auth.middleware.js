const jwt =require("jsonwebtoken")
const tokenBlacklistModel=require("../models/blacklist.model")



async function authUser(req,res,next){
    const token =req.cookies.token

    if(!token){
        return res.status(401).json({message:"Token not provide"})

    }

    const isTokenBlacklisted=await tokenBlacklistModel.findOne({token})

    if(isTokenBlacklisted){
        
        return res.status(401).json({message:"Token is Invalid "})
    }   

    try{
     const decoded=jwt.verify(token,process.env.JWT_SECRET)
      req.user =decoded

      next()
    } catch(err){
        message:"Invalid token."
    }

}

module.exports={  authUser }