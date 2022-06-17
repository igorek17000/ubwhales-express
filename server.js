// ========== Import ==========
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser')
const UserRoute = require('./routes/user_route')
const {CartRoute, cartSocket} = require('./routes/cart_route')
const ConfigRoute = require('./routes/config_route');
const HistoryRoute = require('./routes/history_route');
const MyTicketsRoute = require('./routes/my_tickets_route');
const { authorizer } = require('./middleware/middleware');
const WalletRoute = require('./routes/wallet_route');
require('dotenv').config()
const { createServer } = require("http")
const { Server } = require("socket.io");
const Binance = require('node-binance-api');
const binance = new Binance() 



// ========== Declare Variable ========== 
const app = express()
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL


const httpServer = createServer()

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


app.use((req, res, next)=>{
  req.io= io
  next()
})

// ========== Use Middleware ========== 
app.use(cors())
app.use(bodyParser.json())
app.use('/user', UserRoute)
app.use('/cart', CartRoute)
app.use('/history', HistoryRoute)
app.use('/wallet', WalletRoute)
app.use('/config', ConfigRoute)
app.use('/ticket', MyTicketsRoute)

// ========== DB Connection ========== 

mongoose.connect(DB_URL, ()=>{
  console.log('Database Connected')
});



io.on('connection', socket=>{
  cartSocket(socket)
  binance.futuresMarkPriceStream('BTCUSDT', ticker=>{
    if(ticker != "undefined" ){
      socket.emit('btcStream', ticker?.indexPrice)
    }
  })
  binance.futuresMarkPriceStream('ETHUSDT', ticker=>{
    if(ticker != "undefined" ){
      socket.emit('ethStream', ticker?.indexPrice)
    }
  })
  binance.futuresMarkPriceStream('BNBUSDT', ticker=>{
    if(ticker != "undefined" ){
      socket.emit('bnbStream', ticker?.indexPrice)
    }
  })
})




// io.on('connection', (socket)=>{
//  socket.emit('wow', 'wow')
// })

 
 
 const socketServer = httpServer.listen(5000)
// socketServer.keepAliveTimeout = 61000 * 1000;

const expressServer = app.listen(PORT, ()=>{
  console.log('Server is running with Port '+PORT)
})
// expressServer.keepAliveTimeout = 61000 * 1000;

