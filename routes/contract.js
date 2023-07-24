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

            // const address = req.session.logined.wallet
            // console.log('지갑주소--index로', address)
            //const balance = await token.balance_of(address)
            // console.log('지갑충전-- index로', balance)
            res.render('index', {
                login_data : req.session.logined, 
                balance : req.session.logined.charge_amount
            })
        }
    })

    router.get('/charge_list', async (req, res)=>{
        const user = req.session.logined.username
        const kp_amount = req.session.logined.charge_amount    
        if(!req.session.logined){
            res.redirect("/")
        }else{    
           const phone = req.session.logined.phone 

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
                    console.log("result=", result)
                    console.log("result=", result.length) 
                    console.log("kp_amount =",    kp_amount)  
                    res.render('charge_list', {
                        'resultt': result,
                        'username' : user, 
                        'charge_amount' :  kp_amount,
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
            // const add = req.session.logined.wallet
            const phone = req.session.logined.phone
            console.log('휴대폰번호 : ', phone)
            const user = req.session.logined.username
            // console.log('로그인세션 지갑주소--charge', add)
            // const balance = await token.balance_of(add)
            // console.log('로그인세션 현재 KP--charge', balance)
           res.render('charge', {
                'phone' : req.session.logined.phone, 
                'username' : req.session.logined.username, 
                // 'wallet' : req.session.logined.wallet, 
                'chargeamount' : req.session.logined.charge_amount
                })
            }
            })    

    router.post('/charge', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
            }else{
                const s = req.body.state
                console.log("state=", s)
                const _price = await req.body.price
                const date = moment()
                const chargedate = date.format("YYYY-MM-DD : hh-mm-ss")
                const _phone=req.session.logined.phone
                const chargeamount=req.session.logined.charge_amount
                const sql = `
                        insert 
                        into 
                        charge_list
                        values (?,?,?)
                        `
                const values = [_phone, chargedate, _price ]
                connection.query(
                    sql, 
                    values, 
                    function(err, result){
                        if(err){
                            console.log(err)
                            res.send(err)
                            }
                        })

                
            //충전금액 수정        
                const _charge_amount = parseInt(chargeamount) + parseInt(_price)

                const sql2 = `
                    update
                    log_info
                    set
                    charge_amount = ?
                    where
                    phone = ?
                    `
                const values2 = [_charge_amount, _phone]
                                
                connection.query(
                    sql2, 
                    values2, 
                    function(err, result){
                        if(err){
                            console.log(err)
                            res.send(err)
                            }
                        })                       

            console.log("charge 성공")
            //req.session.logined = result[0]
        }
            res.redirect("../index")
    })

    router.get('/enterscore', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{    
           const phone = req.session.logined.phone 
        //    const add = req.session.logined.wallet
           const user = req.session.logined.username         
        //    const token1 = await token.balance_of(add)
           const tokenamount = req.session.logined.charge_amount
           const _charge_amount = parseInt(tokenamount)
        //    +parseInt(-2000)
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
                'charge_amount' : _charge_amount,
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
            //    const add = req.session.logined.wallet 
            //    const token1 = await token.balance_of(add)
               const tokenamount = parseInt(tokenamount)+parseInt(-2000)      
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
        //    const add = req.session.logined.wallet
           const user = req.session.logined.username         
        //    const token1 = await token.balance_of(add)
           const tokenamount =req.session.logined.charge_amount
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
                // const wallet = req.session.logined.wallet
                // console.log('로그인세션 지갑주소--charge', wallet)
                const balance = req.session.logined.chagr_amount
                // console.log('balance = ', balance)
                const phone= req.session.logined.phone
                console.log('phone= ', phone)
                const s = req.body.state
                res.render('enterpay', {
                    amount : balance,
                    phone : phone
                })
    }})   

    router.post('/enterpay', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
            }else{
                const numeric6 = req.body._numeric6
                const private = req.session.logined.private
                // const amount = 2000/scrn
                const _holein = 0
                const _strok = 0
                const date = moment()
                const _input_dt = date.format("YYYY-MM-DD : hh-mm-ss")
                const _phone =  req.session.logined.phone
                const _username =  req.session.logined.username
                const _picture = ""
                if(numeric6 == req.session.logined.numeric6){
                    //대회참가비 결제
                    const balance = parseInt(req.session.logined.charge_amount)-2000

                    //스코어리스트에 기록
                    const sql=
                            `
                            insert 
                            into 
                            score 
                            values ( ?, ?, ?, ?, ? )`

                    const values = [_input_dt, _phone, _username,  _strok , _picture]
                    
                    connection.query(
                    sql,
                    values,
                    (err, result)=>{
                            if(err){
                                console.log(result)
                                res.send(err)
                            }

                        })
                    console.log("//대회참가비 결제")

                //충전금액 수정        
                const _charge_amount =  balance

                const sql2 = `
                    update
                    log_info
                    set
                    charge_amount = ?
                    where
                    phone = ?
                    `
                const values2 = [_charge_amount, _phone]
                                
                connection.query(
                    sql2, 
                    values2, 
                    function(err, result){
                        if(err){
                            console.log(err)
                            res.send(err)
                            }
 
                            // console.log("result[0]=",result)    
                            console.log("//충전금액 수정 ")
                            console.log("req.session.logined= ",req.session.logined)
                            // req.session.logined = result[0]
                            res.render("index",{
                                login_data : req.session.logined, 
                                amount :_charge_amount
                        
                    }) 
                    })
                }}
            })

    router.get('/gamepay_list', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{    
            const phone = req.session.logined.phone 
            // const add = req.session.logined.wallet
            const user = req.session.logined.username         
            // const token1 = req.session.logined.chagr_amount
            const tokenamount = req.session.logined.chagr_amount
            const sql = `
                    select 
                    *
                    from 
                    store_pay
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
     
                res.render('gamepay_list', {
                    'resultt': result,
                    'username' : user, 
                    'charge_amount':tokenamount,
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
                // const wallet = req.session.logined.wallet
                const balance = req.session.logined.chagr_amount
                const phone= req.body.phone
                const s = req.body.state
                res.render('gamepay', {
                    amount : balance,
                    phonenum : phone,
                    username : req.session.logined.username
                })
    }}) 

    router.post('/gamepay', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
            }else{
                var storename=""
                const golfstore = req.body.input_golfstore
                switch (golfstore) {
                        case "1":
                            console.log("바르셀로나 스크린")
                            storename = "바르셀로나"
                            break
                        case "2":
                            console.log("중앙자이언트 골프존파크")
                            storename = "중앙자이언트"
                            break
                        case "3":
                            console.log("XPGA 스크린")
                            storename = "XPGA스크린"
                            break
                        case "4":
                            console.log("참조은 스크린")
                            storename = "참조은 스크린"
                            break
                        case "5":
                            console.log("창원케이골프클럽")
                           storename = "창원케이골프클럽"
                            break
                        default:
                            console.log(" 1, 2, 3, 4,5 중 하나가 아닙니다");
                        }
                    // const walletfrom = req.session.logined.wallet
                    const pay_amount = req.body._gamepayment
                    const date = moment()
                    const _input_dt = date.format("YYYY-MM-DD : hh-mm-ss")
                    const _phone =  req.session.logined.phone
                    const _username = req.session.logined.username
                    const _storename  = storename
                     // const receipt = await token.trans_from_to_token(walletfrom, towallet, amount)
                    const balance = parseInt(req.session.logined.charge_amount) -  parseInt(pay_amount)
                    // console.log("after", amount*100, balance )
                    var charge_amount= 0

                //거래내역 기록 
               const sql=
                        `
                        insert 
                        into 
                        store_pay
                        values ( ?, ?, ?, ?, ? )`
                const values = [_input_dt, _phone, _username, _storename, pay_amount]
                
                connection.query(
                    sql,
                    values,
                    (err, result)=>{
                            if(err){
                                console.log(result)
                                res.send(err)
                            }
                        }
                    )

                //기존 store amount select 
                const sql2 = `
                    select 
                    *
                    from 
                    store
                    where 
                    storename = ?
                    `
                const values2 = [ _storename]
                connection.query(
                    sql2, 
                    values2, 
                    function(err, result2){
                        if(err){
                            console.log(err)
                        }  
                        console.log("resultt=",result2) 
                        
                charge_amount = parseInt(result2.store_amount) + parseInt(pay_amount)
            }) 

                //store의 chage금액 수정
                const sql3 = `
                    update
                    store
                    set
                    store_amount = ?
                    where
                    storename = ?
                    `
                const values3 = [charge_amount, _storename]
                connection.query(
                    sql3, 
                    values3, 
                    function(err, result3){
                        if(err){
                            console.log(err)
                        }}   
                )

                //log_info 충전금액 수정        
                const _charge_amount =  balance

                const sql4 = `
                    update
                    log_info
                    set
                    charge_amount = ?
                    where
                    phone = ?
                    `
                const values4 = [_charge_amount, _phone]
                connection.query(
                    sql4, 
                    values4, 
                    function(err, result4){
                        if(err){
                            console.log(err)
                        }}   
                )                                

                    res.render("index",{
                        login_data : req.session.logined, 
                        amount : balance
                    })
                }
            })


    return router;
    }