const mongoose = require('mongoose')

const winNumsSchema = new  mongoose.Schema({
  batchId: { type: String, unique: true },
  win_nums:{ type: Object, required: true }
 
})

const winNumsModel = mongoose.model('WinNums', winNumsSchema)

module.exports = winNumsModel