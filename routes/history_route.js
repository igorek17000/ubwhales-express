const express = require('express')
const { authorizer } = require('../middleware/middleware')
const historyModel = require('../models/history_model')
const HistoryRoute = express.Router()

HistoryRoute.get('/', authorizer, (req,res)=>{
  console.log(req.user)
  historyModel.find({user:req.user.id}).populate('user').populate('cart')
  .exec((err, result)=>{
    res.send(result)
  })
})


module.exports = HistoryRoute