const mongoose = require('mongoose')

const historySchema = new  mongoose.Schema({
  contestId: String,
  type: String,
  bet: String,
  status: String,
  date : Date,
  contractType: String,
  side: String,
  amount: Number,
  currency: String,
  fee: Number,
  feeCurrency: String,
  cart : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  },
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

const historyModel = mongoose.model('History', historySchema)

module.exports = historyModel