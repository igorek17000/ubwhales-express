const mongoose = require('mongoose')

const userOptions = {
  toJSON : {
    virtuals : true
  }
}
const UserSchema = mongoose.Schema({
 email: {
   type: String,
   unique: true,
   required: true
 },
 password: {
   type: String,
   required: true
 }, 
 name: String,
 role : String,
 wallet : {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Wallet'
},
}, userOptions)

UserSchema.virtual('firstname').get(function(){
  return this.name?.split(' ')[0]
})

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel