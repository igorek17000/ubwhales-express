const mongoose = require('mongoose')

const cartOptions = {
  toJSON : {
    virtuals : true
  }
}
const CartSchema = mongoose.Schema({
  currency: String,
  startTime: Date,
  stopTime: Date,
  activeTime: Number,
  lockedPrice: Number,
  closedPrice: Number,
  upPool: Number,
  downPool: Number,
}, cartOptions)

CartSchema.virtual('totalPool').get(function(){
  return this.upPool + this.downPool
})
CartSchema.virtual('upPayout').get(function(){
 const fee = this.totalPool * 0.03
  return  (this.totalPool - fee)/ this.upPool || 0
})
CartSchema.virtual('downPayout').get(function(){
  const fee = this.totalPool * 0.03
  return  (this.totalPool - fee)/ this.downPool || 0
})

const CartModel = mongoose.model('Cart', CartSchema)

module.exports = CartModel