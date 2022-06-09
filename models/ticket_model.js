const mongoose = require('mongoose')

const ticketSchema = new  mongoose.Schema({
  batchId: String,
  ticket: Object,
  status: String,
  date : Date,
  user_id: String,
  /* user : {
    type : mongoose.Schema.Types.ObjectId,
    ref: 'User'
  } */
})

const ticketModel = mongoose.model('Ticket', ticketSchema)

module.exports = ticketModel