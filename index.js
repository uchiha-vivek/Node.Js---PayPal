const express = require('express')

const ejs = require('ejs')
const dotenv = require('dotenv').config()

const paypal = require('paypal-rest-sdk')
// configure options
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'EBWKjlELKMYqRNQ6sYvFo64FtaRLRR5BdHEESmha49TM',
    'client_secret': 'EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM'
  });

const app = express()
const PORT = process.env.PORT || 5000

app.set("view engine" ,"ejs")

app.get('/', function(req,res){
    res.render('index')
})

// payment route
// data taken from https://github.com/paypal/PayPal-node-SDK
app.post('/payment',function(req,res){
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:5000/success",
            "cancel_url": "http://localhost:5000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };
    
    
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for( let i =0 ; i<payment.links.length; i++){
                if(payment.links[i].rel==='approval_url'){
                             res.redirect(payment.links[i].href)
                }
            }
        }
    });
})

 

//successfull payment
app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "25.00"
          }
      }]
    };

    


  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.send('Success');
      }
  });
  }); 
     

     
// cancel route

app.get('/cancel',function(req,res){
    res.send('Cancelled')
})
 



const server = function(){
    app.listen(PORT, function(){
        console.log(`Server is running on PORT ${PORT}`)
    })
}

server()