const mongoose  = require('mongoose')

const walletSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  USDT: Number
})

const WalletModel = mongoose.model('Wallet', walletSchema)
module.exports = WalletModel