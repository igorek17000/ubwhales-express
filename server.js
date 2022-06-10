// ========== Import ==========
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser')
const UserRoute = require('./routes/user_route')
//const {CartRoute, cartSocket} = require('./routes/cart_route')
const ConfigRoute = require('./routes/config_route');
const MyTicketsRoute = require('./routes/my_tickets_route');
const { authorizer } = require('./middleware/middleware');
const WalletRoute = require('./routes/wallet_route');
require('dotenv').config()
const { createServer } = require("http")



// ========== Declare Variable ========== 
const app = express()
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL



// ========== Use Middleware ========== 
app.use(cors())
app.use(bodyParser.json())
app.use('/user', UserRoute)
app.use('/ticket', MyTicketsRoute)
//app.use('/cart', CartRoute)
//app.use('/history', HistoryRoute)
app.use('/wallet', WalletRoute)
app.use('/config', ConfigRoute)

// ========== DB Connection ========== 

mongoose.connect(DB_URL, ()=>{
  console.log('Database Connected')
});
 

const expressServer = app.listen(PORT, ()=>{
  console.log('Server is running with Port '+PORT)
})
// expressServer.keepAliveTimeout = 61000 * 1000;

