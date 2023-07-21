// express를 사용하기 위하여 express 모듈을 로드 
const express = require('express')
// route부분이기 때문에 express.Router()
const router = express.Router()
const moment = require('moment')
var scrn=100
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
                login_data : req.session.logined, 
                balance : balance
            })
        }
    })

    router.get('/charge_list', async (req, res)=>{
        const add = req.session.logined.wallet
        const user = req.session.logined.username
        
        if(!req.session.logined){
            res.redirect("/")
        }else{    
           const phone = req.session.logined.phone 
          
           const token1 = await token.balance_of(add)
           const tokenamount = token1
           const sql = `
                    select 
                    *
                    from 
                    charge_list
                    where 
                    phone = ?
                `
            const values = [phone]
            connection.query(
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                    }
            const resultt = result

            console.log("result=", resultt)
            console.log("result=", resultt.length)        
            res.render('charge_list', {
                'resultt': result,
                'username' : user, 
                'charge_amount' : tokenamount,
                'phone': req.session.logined.phone
                })
            })
        }
})

    router.get('/charge', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{
            const s = req.body.state
            const add = req.session.logined.wallet
            const phone = req.session.logined.phone
            console.log('휴대폰번호 : ', phone)
            const user = req.session.logined.username
            console.log('로그인세션 지갑주소--charge', add)
            const balance = await token.balance_of(add)
            console.log('로그인세션 현재 KP--charge', balance)
           res.render('charge', {
                'phone' : req.session.logined.phone, 
                'username' : req.session.logined.username, 
                'wallet' : req.session.logined.wallet, 
                'chargeamount' : balance,
                })
            }
            })    

    router.post('/charge', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
            }else{
                const s = req.body.state
                // console.log("state=", s)
                const _price = await req.body.price
                // console.log("중전post amount",amount)
                const address = req.session.logined.wallet
                const phone = req.session.logined.phone
                if(s==1){
                    //유저에게 보내는 것
                    const receipt = await token.trade_token(address, _price/100)
                }
                const date = moment()
                const chargedate = date.format("YYYY-MM-DD : hh-mm-ss")
                
                const sql = `
                        insert 
                        into 
                        charge_list
                        values (?,?,?)
                        `
                const values = [phone, chargedate, _price]
                connection.query(
                    sql, 
                    values, 
                    function(err, result){
                        if(err){
                            console.log(err)
                            res.send(err)
                            }
                        })
                        

            console.log("charge 성공")
        }
            res.redirect("index")
    })


    router.get('/enterscore', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{    
           const phone = req.session.logined.phone 
           const add = req.session.logined.wallet
           const user = req.session.logined.username         
           const token1 = await token.balance_of(add)
           const tokenamount = token1
           const sql = `
                    select 
                    *
                    from 
                    score
                    where 
                    phone = ?
                `
            const values = [phone]
            connection.query(
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                    }
            const resultt = result

            console.log("result=", resultt)
            console.log("result=", resultt.length)        
            res.render('enterscore', {
                'resultt': result,
                'username' : user, 
                'charge_amount' : tokenamount,
                'phone': req.session.logined.phone
                })
            })
        }})


        router.post('/enterscore', async (req, res)=>{
            if(!req.session.logined){
                res.redirect("/")
            }else{    
               const phone = req.session.logined.phone 
               const user = req.session.logined.username
               const _holein = req.body.input_holein
               const _strok = req.body.input_strok  
               const add = req.session.logined.wallet 
               const token1 = await token.balance_of(add)
               const tokenamount = token1      
               const _scorepicture = await req.body.input_scorepicture
                
               const sql = `
                        update
                        score
                        set
                        holein = ?,
                        strok = ?,
                        scorepicture = ?
                        where
                        phone = ?
                        `
                
                const values = [_holein,_strok, _scorepicture, phone]
                connection.query(
                    sql, 
                    values, 
                    function(err, result){
                        if(err){
                            console.log(err)
                        }
                const resultt = result
    
                console.log("result=", resultt)
                console.log("result=", resultt.length)        
                res.render('index', {
                    'resultt': result,
                    'username' : user, 
                    'amount' : tokenamount,
                    'phone': req.session.logined.phone,
                    'login_data' : req.session.logined,                    
                    })
                })
            }})


    router.get('/enterpay_list', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{    
           const phone = req.session.logined.phone 
           const add = req.session.logined.wallet
           const user = req.session.logined.username         
           const token1 = await token.balance_of(add)
           const tokenamount = token1
           const sql = `
                    select 
                    *
                    from 
                    score
                    where 
                    phone = ?
                `
            const values = [phone]
            connection.query(
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                    }
            const resultt = result

            console.log("result=", resultt)
            console.log("result=", resultt.length)        
            res.render('enterpay_list', {
                'resultt': result,
                'username' : user, 
                'charge_amount' : tokenamount,
                'phone': req.session.logined.phone
                })
            })
        }
})

    router.get('/enterpay', async (req, res)=>{
        if(!req.session.logined){
            let data=0
            if(req.query.data){
                // data = 1
            }
            res.render('login', {
                'state' : data
            })
        }else{
                const wallet = req.session.logined.wallet
                console.log('로그인세션 지갑주소--charge', wallet)
                const balance = await token.balance_of(wallet)
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
                const private = req.session.logined.private
                const amount = 2000/scrn
                const _holein = 0
                const _strok = 0
                const date = moment()
                const _input_dt = date.format("YYYY-MM-DD : hh-mm-ss")
                const _phone =  req.session.logined.phone
                const _username =  req.session.logined.username
                const _picture = ""
                if(numeric6 == req.session.logined.numeric6){

                    //유저가 회사에  20개(amount) 보내는 것
                    console.log("wallet, amount=",wallet, amount)
                    const receipt = await token.trans_from_token(private, amount)

                    const balance = await token.balance_of(wallet) 
                    console.log("after", amount, balance )
                }
                const sql=
                        `
                        insert 
                        into 
                        score 
                        values ( ?, ?, ?, ?, ?, ?, ? )`

                const values = [_input_dt, _phone, _username, amount, _holein, _strok , _picture]
                
                connection.query(
                sql,
                values,
                (err, result)=>{
                        if(err){
                            console.log(result)
                            res.send(err)
                        }
                        else{
                            console.log("sql=", sql)
                            console.log("numeric6=", numeric6)
                            console.log("req.session.logined.numeric6=",req.session.logined.numeric6)
                        }
                    })
                    res.render("index",{
                        login_data : req.session.logined, 
                        amount : await token.balance_of(wallet) 
                    })
                }
            })

            router.get('/gamepay_list', async (req, res)=>{
                if(!req.session.logined){
                    res.redirect("/")
                }else{    
                   const phone = req.session.logined.phone 
                   const add = req.session.logined.wallet
                   const user = req.session.logined.username         
                   const token1 = await token.balance_of(add)
                   const tokenamount = token1
                   const sql = `
                            select 
                            *
                            from 
                            store
                            where 
                            phone = ?
                        `
                    const values = [phone]
                    connection.query(
                        sql, 
                        values, 
                        function(err, result){
                            if(err){
                                console.log(err)
                            }
                    const resultt = result
        
                    console.log("result=", resultt)
                    console.log("result=", resultt.length)        
                    res.render('gamepay_list', {
                        'resultt': result,
                        'username' : user, 
                        'charge_amount' : tokenamount,
                        'phone': req.session.logined.phone
                        })
                    })
                }
        })

    router.get('/gamepay', async (req, res)=>{
        if(!req.session.logined){
            let data=0
            if(req.query.data){
                // data = 1
            }
            res.render('login', {
                'state' : data
            })
        }else{
                const wallet = req.session.logined.wallet
                const balance = await token.balance_of(wallet)
                const phone= req.body.phone
                const s = req.body.state
                res.render('gamepay', {
                    wallet : wallet,
                    amount : balance,
                    phonenum : phone,
                    username : req.session.logined.username
                })
    }}) 

    router.post('/gamepay', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
            }else{
                const towallet=""
                const golfstore = req.body.input_golfstore
                switch (golfstore) {
                        case "1":
                            console.log("바르셀로나")
                            towallet = "0xc0E129613cc382273f3c1036a34FE0BE477A083e"
                            break
                        case "2":
                            console.log("중앙자이언트")
                            towallet = "0x24EfD8233f75D73D45Fe472594a2CE5f116caEA6"
                            break
                        case "3":
                            console.log("XPGA스크린")
                            towallet = "0x0A99Ab5b2d505eE2C92768AaE2C30D03b4010d18"
                            break
                        case "4":
                            console.log("참조은 스크린")
                            towallet = "0x20928A527e21A3Fd7f1A7B4F546c9C080A82B5d8"
                            break
                        case "5":
                            console.log("창원케이골프클럽")
                            ctowallet = "0x59FF49F0bE33366A866306b8050b5292b9783078"
                            break
                        default:
                            console.log(" 1, 2, 3, 4,5 중 하나가 아닙니다");
                        }
                    const walletfrom = req.session.logined.wallet
                    const amount = req.body._gamepayment/scrn
                    const date = moment()
                    const _input_dt = date.format("YYYY-MM-DD : hh-mm-ss")
                    const _phone =  req.session.logined.phone
                    const _username =  req.session.logined.username
                    const receipt = await token.trans_from_to_token(walletfrom, towallet, amount)
                    const balance = await token.balance_of(wallet) 
                    console.log("after", amount*100, balance )
                }
               const sql=
                        `
                        insert 
                        into 
                        store
                        values ( ?, ?, ?, ?, ?, ?, ? )`
                const values = [_input_dt, _phone, _username, walletfrom, towallet, amount]
                
                connection.query(
                sql,
                values,
                (err, result)=>{
                        if(err){
                            console.log(result)
                            res.send(err)
                        }
                    res.render("index",{
                        login_data : req.session.logined, 
                        amount : balance2
                    })
                }
            )
    })

    return router;
    }