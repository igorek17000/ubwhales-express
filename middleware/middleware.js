require('dotenv').config()
const jwt = require('jsonwebtoken')

function authorizer(req, res, next){
  const token = req.headers.token.split(' ')[1]
   jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
    if(!err){
      req.user = user
      next()
    }else{
      res.sendStatus(403)
    }
   })
  
}

module.exports = {authorizer}