const jwt = require("jsonwebtoken");
const {promisify} = require("util")


exports.decodeToken=async(token, secret)=>{
    const decryptedToken = await promisify(jwt.verify)(token, secret);
    return decryptedToken;
}