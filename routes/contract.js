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
            console.log('지갑주소--index로', address)
            const balance = await token.balance_of(address)
            console.log('지갑충전-- index로', balance)
            res.render('index', {
                info : req.session.logined, 
                balance : balance
            })
        }
    })

    router.get('/charge', async (req, res)=>{
        const add = req.session.logined.wallet
        console.log('지갑주소--충전으로', add)
        const balance = await token.balance_of(add)
        console.log('지갑충전갯수--충전으로', balance)
        res.render('charge', {
            wallet : add,
            amount : balance
        })
    })    

    router.post('/charge', (req, res)=>{
        const amount = req.body._amount
        const address = req.session.logined.wallet
        const s = req.body.state
        if(s == 1){

        const receipt = token.trade_token(address, amount)
        console.log(receipt)
        }
        res.redirect("/")
    })

    router.get('/enterpay', (req, res)=>{
        const wallet = req.session.logined.wallet
        const amount = req.body._amount
        const s = req.body.state
        res.render('enterpay', {
            wallet : wallet,
            login_data: req.session.logined
        })
    })   

    router.post('/enterpay', (req, res)=>{
        const amount = req.body._amount
        const wallet = req.session.logined.wallet
        const s = req.body.state
        if(s == 1){

        const receipt = token.trans_from_token(address, amount)
        console.log(receipt)
        }
        res.redirect("/index")
    })

    return router;
}