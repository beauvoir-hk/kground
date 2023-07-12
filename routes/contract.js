// express를 사용하기 위하여 express 모듈을 로드 
const express = require('express')
// route부분이기 때문에 express.Router()
const router = express.Router()
const moment = require('moment')
// mysql의 정보를 등록
const mysql = require('mysql2')
// mysql server 정보를 입력
const connection = mysql.createConnection({
    host : process.env.host, 
    port : process.env.port, 
    user : process.env.user, 
    password : process.env.password,
    database : process.env.database
})

//token.js 파일 로드 
const token = require("../token/token")
module.exports = ()=>{


    router.get("/", async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{

            const address = req.session.logined.wallet
            // console.log('지갑주소--index로', address)
            const balance = await token.balance_of(address)
            // console.log('지갑충전-- index로', balance)
            res.render('index', {
                info : req.session.logined, 
                balance : balance
            })
        }
    })

    router.get('/charge', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{
            const add = req.session.logined.wallet
            const user = req.session.logined.username
            console.log('로그인세션 지갑주소--charge', add)
            const balance = await token.balance_of(add)
            console.log('로그인세션 현재 KP--charge', balance)
            res.render('charge', {
                wallet : add,
                amount : balance,
                username : user
            })
        }})    

    router.post('/charge', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
            }else{
                const s = req.body.state
                // console.log("state=", s)
                const amount = req.body.price
                // console.log("중전post amount",amount)
                const address = req.session.logined.wallet
                // console.log("충전post address",address)

                if(s==1){
                    //유저에게 보내는 것
                    const receipt = await token.trade_token(address, amount)
                // console.log(receipt)
                }
            res.render("payappthird.ejs")
    }})

    router.get('/enterpay', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
            }else{
                const wallet = req.session.logined.wallet
                console.log('로그인세션 지갑주소--charge', wallet)
                const balance = await token.balance_of(wellet)
                console.log('balance = ', balance)
                const phone= req.body.phone
                console.log('phone= ', phone)
                const s = req.body.state
                res.render('enterpay', {
                    wallet : wallet,
                    amount : balance,
                    phonenum : phone
                })
    }})   


     
    router.post('/enterpay', async (req, res)=>{
            if(!req.session.logined){
                res.redirect("/")
                }else{
                    const numeric6 = req.body._numeric6
                    const wallet = req.session.logined.wallet
                    const amount = 2000/100
                    const _holein = 0
                    const _strok = 0
                    const date = moment()
                    const _input_dt = date.format("YYYY-MM-DD : hh-mm-ss")
                    const _phone =  req.session.logined.phone
                    const _username =  req.session.logined.username
                    const _picture = ""
                    const timestamp = date.unix()
                    const balance = await token.balance_of(wallet)
                    const sql=
                            `
                            insert 
                            into 
                            score 
                            (timestamp, _input_dt, _phone, _username, _holein, _strok, _picture) 
                            values ( ?, ?, ?, ?, ?, ?, ? )`
    
                    const values = [timestamp, _input_dt, _phone, _username, _holein, _strok , _picture]
                    
                    connection.query(
                    sql,
                    values,
                    (err, result)=>{
                            if(err){
                                console.log(result)
                                res.send(err)
                            }
                            else{
                                if(numeric6==req.session.logined.numeric6){
                                    //유저가 회사에  20개 보내는 것
                                    const receipt = token.trans_from_token(wallet, amount) 
                                    console.log(amount, balance)
                                }
                                else{
    
                                }
                            }
                        })
                    }
                
        res.render("index")
        })


        return router;
}