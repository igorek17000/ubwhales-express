const express = require("express");
const mongoose = require("mongoose");

const { Server } = require("socket.io");
const { authorizer } = require("../middleware/middleware");
const CartModel = require("../models/cart_model");
const historyModel = require("../models/history_model");
const WalletModel = require("../models/wallet_model");
const CartRoute = express.Router();
const Binance = require("node-binance-api");
const { JsonWebTokenError } = require("jsonwebtoken");
const binance = new Binance();
// ============ Generate Cart ==============
// const OneMinute = 1000*10
// const FiveMinute = 1000*20
// const FifteenMinute = 1000*30

const OneMinute = 1000 * 60;
const FiveMinute = 1000 * 60 * 5;
const FifteenMinute = 1000 * 60 * 15;
const HalfHour = 1000 * 60 * 30;
const OneHour = 1000 * 60 * 60;
const OneDay = 1000 * 60 * 60 * 24;

let socket;
function cartSocket(sock) {
  socket = sock;
}

CartRoute.post("/:id", authorizer, (req, res) => {
  if (req.body.upPool) {
    CartModel.findOne({ _id: req.params.id }, function (err, result) {
      const history = new historyModel({
        contestId: req.params.id,
        type: "trade",
        bet: "up",
        status: "live",
        date: new Date(),
        contractType: "1Min",
        amount: req.body.upPool,
        currency: "BTC",
        fee: 1,
        feeCurrency: "USDT",
        cart: req.params.id,
        user: req.user.id,
      });
      result.upPool = Number(req.body.upPool) + Number(result.upPool);
      result.save(() => {
        if (socket) {
          socket.emit("update", true);
        }
        res.status(200).send({ message: "done" });
        WalletModel.findOne({ email: req.user.email }).then((wallet) => {
          wallet.USDT = wallet.USDT - req.body.upPool;
          wallet.save();
        });
        history.save((err, response) => {
          console.log("history saved");
        });
      });
    });
  }

  if (req.body.downPool) {
    CartModel.findOne({ _id: req.params.id }, function (err, result) {
      const history = new historyModel({
        contestId: req.params.id,
        type: "trade",
        bet: "down",
        status: "live",
        date: new Date(),
        contractType: "1Min",
        amount: req.body.downPool,
        currency: "BTC",
        fee: 1,
        feeCurrency: "USDT",
        cart: req.params.id,
        user: req.user.id,
      });
      result.downPool = Number(req.body.downPool) + Number(result.downPool);
      result.save(() => {
        if (socket) {
          socket.emit("update", true);
        }
        res.status(200).send({ message: "done" });
        WalletModel.findOne({ email: req.user.email }).then((wallet) => {
          wallet.USDT = wallet.USDT - req.body.downPool;
          wallet.save();
        });
        history.save((err, response) => {
          console.log("history saved");
        });
      });
    });
  }
});

CartRoute.get("/", (req, res) => {
  const options = JSON.parse(req.headers.options);
  CartModel.find({
    currency: options.selectedCoin,
    activeTime: options.selectedTime,
  }).exec((err, result) => {
    res.send(result);
  });
});

function generateCart(props) {
  binance.futuresMarkPrice(props.currency + "USDT").then((coin) => {
    const Cart = new CartModel({
      currency: props.currency,
      activeTime: props.activeTime,
      startTime: new Date(),
      lockedPrice: coin.indexPrice,
      upPool: 0,
      downPool: 0,
    });

    Cart.save(function (err, res) {
      if (err) {
        console.log(err);
      } else {
        const id = res._id + "";
        console.log("saved");
        setTimeout(function () {
          if (id) {
            binance.futuresMarkPrice(props.currency + "USDT").then((coin2) => {
              CartModel.findOneAndUpdate(
                { _id: id },
                {
                  stopTime: new Date(),
                  closedPrice: coin2.indexPrice,
                }
              ).then(() => {
                console.log("updated");
                historyModel
                  .find({ contestId: id })
                  .populate("cart")
                  .populate("user")
                  .then((histories) => {
                    histories.forEach((item) => {
                      const result = item.cart.closedPrice - item.cart.lockedPrice;
                      const status = result > 0 && item.bet == "up" || result < 0 && item.bet == "down" ? 'win' : 'loss'
                      historyModel.findOneAndUpdate({_id: item._id}, {$set:{status: status }})
                      .then(res=>console.log(res, 'status test'))
                      if (result > 0 && item.bet == "up") {
                        console.log('up')
                        WalletModel.findOne({ email: item.user.email }).then(
                          (wallet) => {
                            console.log(wallet.USDT, typeof wallet.USDT, 'walletusdt')
                            console.log(item.amount, typeof item.amount, 'amount of item')
                            wallet.USDT = Number(wallet.USDT) + (Number(item.amount) * 2);
                            wallet.save()
                            socket.emit("update", true);
                          }
                        );
                      } else if (result < 0 && item.bet == "down") {
                        console.log('down')
                        WalletModel.findOne({ email: item.user.email }).then(
                          (wallet) => {
                            wallet.USDT = Number(wallet.USDT) +( Number(item.amount) * 2);
                            wallet.save()
                            socket.emit("update", true);
                          }
                        );
                      }
                    });
                  });
              });
              if (socket) {
                socket.emit("update", true);
              }
            });
            setTimeout(() => {
              CartModel.deleteOne({ _id: id }, (result) => {
                console.log("deleted", id);
              });
            }, props.activeTime * 3);
          }
        }, props.activeTime);
      }
    });
  });
}

// One Minute Generate
setInterval(() => {
  generateCart({
    currency: "BTC",
    activeTime: OneMinute,
  });
  generateCart({
    currency: "ETH",
    activeTime: OneMinute,
  });
  generateCart({
    currency: "BNB",
    activeTime: OneMinute,
  });
}, OneMinute);

// setInterval(()=>{
//   generateCart({
//     currency : 'BTC',
//     activeTime: FiveMinute
//   })
//   generateCart({
//     currency : 'ETH',
//     activeTime: FiveMinute
//   })
//   generateCart({
//     currency : 'BNB',
//     activeTime: FiveMinute
//   })
// },FiveMinute)
// setInterval(()=>{
//   generateCart({
//     currency : 'BTC',
//     activeTime: FifteenMinute
//   })
//   generateCart({
//     currency : 'ETH',
//     activeTime: FifteenMinute
//   })
//   generateCart({
//     currency : 'BNB',
//     activeTime: FifteenMinute
//   })
// },FifteenMinute)

// CartModel.find().$where(function(){
//   return this.totalPool > 100 && this.lockedPrice == 35
// })
// .then (res=>{
//   console.log(res)
// })

module.exports = { CartRoute, cartSocket };
