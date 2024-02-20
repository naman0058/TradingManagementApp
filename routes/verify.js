var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const secretkey = 'ashdgjgssfdgSFGF'


// function userAuthenticationToken(req,res,next){
//     // const token = req.headers['authrorization'];
//     const token = undefined
//     if(!token) return res.status(401).json({message : 'Token not provided'})
//     jwt.verify(token,secretkey,(err,data)=>{
//       if(err) res.status(401).json({message:'Invalid Token Recieved'})
//       req.user = data
//       next();
//     })
//   }


function userAuthenticationToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
  }
  jwt.verify(token, secretkey, (err, data) => {
      if (err) {
          return res.status(401).json({ message: 'Invalid Token Received' });
      }
      req.user = data;
      next();
  });
}



function adminAuthenticationToken(req,res,next){
    const token = req.headers['authrorization'];
    if(!token) return res.sendStatus(401)
    jwt.verify(token,secretkey,(err,user)=>{
      if(err) res.sendStatus(403)
      req.user = user
      next();
    })
}


  module.exports = {
    userAuthenticationToken,
    adminAuthenticationToken
  }


//   wkltwfbwnhnvzmwr