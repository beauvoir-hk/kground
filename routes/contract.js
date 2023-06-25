// express를 사용하기 위하여 express 모듈을 로드 
const express = require('express')
// route부분이기 때문에 express.Router()
const router = express.Router()

const token = require('../token/token')

module.exports = ()=>{


    router.get("/", async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{
            const address = req.session.logined.wallet
            const balance = await token.balance_of(address)
            res.render('index', {
                info : req.session.logined, 
                balance : balance
            })
        }
    })

    router.get('/charge', (req, res)=>{
        const wallet = req.session.logined.wallet;
        res.render('charge', {
            wallet : wallet
        })
    })    

    router.post('/charge', (req, res)=>{
        const amount = req.body._amount
        const address = req.session.logined.wallet
        const s = req.body.state
        if(s == 1){
            const receipt = token.trade_token(address, amount/100)
            console.log(receipt)
        }
        res.redirect("/")
    })


    return router;
}