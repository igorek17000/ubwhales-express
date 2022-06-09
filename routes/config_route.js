const express = require('express')
const ConfigRoute = express.Router()

ConfigRoute.get('/', (req, res)=>{
  res.send('config')
})

module.exports = ConfigRoute