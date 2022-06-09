const express = require('express')
const { authorizer } = require('../middleware/middleware')
const ticketModel = require('../models/ticket_model')
const winNumsModel = require('../models/win_nums_model')
const MyTicketsRoute = express.Router()

/* MyTicketsRoute.get('/', authorizer, (req,res)=>{
  console.log(req.user)
  ticketModel.find({user:req.user.id}).populate('user')
  .exec((err, result)=>{
    res.send(result)
  })
}) */

MyTicketsRoute.get('/', (req,res)=>{
        console.log(req.user)

        let cnt = 0
        let cnt2 = 0
        
          ticketModel.find().sort({'_id':-1})
            .exec((err, result)=>{

              const tickets = result

              tickets.forEach(function (item, index) {

                if(item.status == "pending"){

                  cnt++ 
                  winNumsModel.find({ batchId: item.batchId})

                    .exec((err, result)=>{

                      let winNumbers = 0

                      if(result[0] !== undefined){

                        winNumbers = result[0].win_nums

                      }

                          const userTicket = item.ticket;
                         
                          let status = "";
                          let amount_to_win = 123456 
            
                          if(result[0] !== undefined && winNumbers){

                                    let matchesFound = winNumbers.filter(i => userTicket.includes(parseInt(i) ));
                                    
                                    if(matchesFound.length === 2){
                    
                                      status = '$2'
                                      
                                    }else if(matchesFound.length === 3){
                    
                                      status = '$5'
                                      
                                    }else if(matchesFound.length === 4){
                    
                                      status = `$ ${amount_to_win * 0.03}`
                                      
                                    }else if(matchesFound.length === 5){
                    
                                      status = `$ ${amount_to_win * 0.04}`
                                      
                                    }else if(matchesFound.length === 6){
                    
                                      status = `$ ${amount_to_win * 0.75}`
                                      
                                    }else{
                    
                                      status = `no win`
                    
                                    }

                                    item.status = status
                                    cnt2++
  
                                    ticketModel.updateOne({'_id':item._id},
                                    {$set:{'status':status}}) .exec((err, result)=>{

                                        console.log(result)
                                        
                                    })
                                     
  
                                    //console.log(winNumbers, userTicket, status)

                          } // if win numbers have been uploaded for that batch
                                    
                    }) //fetch batch win numbers
                }//if pending ticket exists run this update else...
                else{
                    
                  //untouched

                }
                
              }); //check each ticket for pending status

              console.log(cnt)


              if(cnt < 1){ //if none is pending

                res.send(result)
                
              }
              else if(cnt2 > 0){ //if pending and updated
   
                  res.send(tickets)
                  console.log(tickets)
  
  
              }else{
                console.log('pls wait...')
                res.send(tickets)
              }

            })

            


          //res.send(result)
  })





MyTicketsRoute.get('/get-win-nums', (req,res)=>{
  console.log(req.user)
  winNumsModel.find().sort({'_id':-1}).limit(1)
  //ticketModel.find({user:req.user.id}).populate('user')
  .exec((err, result)=>{
    res.send(result) 
  })
})


MyTicketsRoute.get('/get-all-win-nums', (req,res)=>{
  console.log(req.user)
  winNumsModel.find().sort({'_id':-1})
  //ticketModel.find({user:req.user.id}).populate('user')
  .exec((err, result)=>{
    res.send(result) 
  })
})




MyTicketsRoute.post('/', (req, res)=>{
  
  const Ticket = new ticketModel({
    batchId: req.body.ticket.batch, 
    ticket: req.body.ticket.nums,
    status: req.body.ticket.status,
    user_id: req.body.ticket.id,
    date: new Date(),
    
  })
 
    Ticket.save((err, result)=>{
      if(!err){
        res.send({message: 'ticket saved', result})
      }else{
        console.log(err)
      }
    })
  })



  MyTicketsRoute.post('/save-win-nums', (req, res)=>{
  
    const winNums = new winNumsModel({
      batchId: req.body.win_nums.batchId, 
      win_nums: req.body.win_nums.nums,
      
    })

    //res.send(req.body.win_nums.batchId)
       winNums.save((err, result)=>{
        if(!err){
          res.send({'result':'winning numbers uploaded!'})
        }else{
          console.log(err)
        }
      }) 

    })
  



module.exports = MyTicketsRoute