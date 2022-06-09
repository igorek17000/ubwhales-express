const express = require('express')
const { authorizer } = require('../middleware/middleware')
const WalletModel = require('../models/wallet_model')
const WalletRoute = express.Router()

// const wallet = new WalletModel({
//   email: 'rana028511@gmail.com',
//   BTC: 200,
//   ETH: 1500,
//   USDT: 31500
// })
// wallet.save((err, res)=>{
//   console.log(res)
// })
WalletRoute.get('/',authorizer, (req, res)=>{
  WalletModel.findOne({ email: req.user.email })
  .then(result=>{
    console.log(result)
  })
})

WalletRoute.post('/', authorizer, (req, res) => {
  const from = req.user.email
  const { to, amount, currency } = req.body
  WalletModel.findOne({ email: from })
    .then((fromUser) => {
      console.log(fromUser[currency])
      fromUser[currency] = fromUser[currency] - amount
      fromUser.save((err, walletResult) => {
        console.log(walletResult)
      })
    })
  WalletModel.findOne({ email: to })
    .then((toUser) => {
      toUser[currency] = toUser[currency] + amount
      toUser.save((err, walletResult) => {
        console.log(walletResult)
      })
    })
})

module.exports = WalletRoute