const jwt = require('jsonwebtoken');
const {decodeToken} = require('../services/decodeToken');
const { users } = require('../model');

exports.isAuthenticated =async(req, res, next)=>{
    // console.log("request cookies",req.cookies);
 try {
       const token= req.cookies.token;
    if(!token){
        res.redirect("/login");
    }else{
        const decodedToken= await decodeToken(token, process.env.SECRET_KEY)
        console.log("decodedToken",decodedToken);
        const userExist = await users.findAll({where:{
            id:decodedToken.id
        }
        })
        console.log(userExist)
        if (userExist.length == 0) {
            console.log("user doesnt exist")
            res.send("User doesn't exist");
        }else{
            req.user=userExist;
            req.userId=userExist[0].id;
            // console.log("userId middleware",userExist[0].id)
            // req.organizationNumber=userExist[0].currentOrganization;
            next();
        }
    }
 } catch (error) {
    console.log("error",error.message)
 }
    
}