// express를 사용하기 위하여 express 모듈을 로드 
const express = require('express')
const fs = require('fs')
// route부분이기 때문에 express.Router()
const router = express.Router()
const moment = require('moment')

// 파일 업로드를 사용하기위한 모듈
const multer = require('multer')
const storage = multer.diskStorage(
    {
        destination : function(req, file, cb){
            cb(null, './public/uploads/')
        }, 
        filename : function(req, file, cb){
            cb(null, file.originalname)
        }
    }
)
// 유저가 보낸 파일을 저장할 위치를 설정
const upload = multer({
    storage : storage
})

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
// const token = require("../token/token")
module.exports = ()=>{


    router.get("/", async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{
            res.render('index', {
                login_data : req.session.logined, 
                balance : req.session.logined.charge_amount
            })
        }
    })

    router.get('/charge_list', async (req, res)=>{
        const user = req.session.logined.username
        const kp_amount = req.session.logined.charge_amount   
        const phone = req.session.logined.phone 
        if(!req.session.logined){
            res.redirect("/")
        }else{    
 
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
                        'amount' :  kp_amount,
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
            const phone = req.session.logined.phone
            console.log('휴대폰번호 : ', phone)
            const user = req.session.logined.username
           res.render('charge', {
                'phone' : req.session.logined.phone, 
                'username' : req.session.logined.username, 
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
                const chargedate = date.format('YYYY-MM-DD HH:MM:SS')
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

    router.get('/trans_list', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{    
            const phone = req.session.logined.phone 
            const user = req.session.logined.username   
            const amount = req.session.logined.charge_amount
            const sql = `
                CREATE TABLE new_table AS
                SELECT *
                FROM charge_list
                LEFT JOIN score
                ON charge_list.phone = score.phone
                LEFT JOIN store_pay
                ON score.phone = store_pay.phone
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
                    }else{
                        console.log("result=",result.length)
                        console.log("result=",result[0])
                        console.log("result=",result[5])
                        console.log("result=",result[10])
                        res.render('trans_list', {
                            'resultt': result,
                            'username' : user, 
                            'amount' : amount,
                            'phone': phone
                        })
                    }}                       
                    )}          })           


    router.get('/score_list', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{    
           const phone = req.session.logined.phone 
           const user = req.session.logined.username         
           const tokenamount = req.session.logined.charge_amount
           const _charge_amount = parseInt(tokenamount)
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
            res.render('score_list', {
                'resultt': result,
                'username' : user, 
                'amount' : _charge_amount,
                'phone': req.session.logined.phone
                
                })
            })
        }})

    router.get('/enterscore', function(req, res){
        
        // const data = { entertime: 2023-07-12T23:08:12.000Z  }
        // entertime = JSON.parse(data)[entertime];
        console.log('The entertime is: ', entertime )

        const sql = `
            select 
            * 
            from 
            score 
            where 
            entertime = ?
        `
        const values = [entertime]

        connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log(err)
                    res.send(err)
                }else{
                    console.log(result)
                    console.log('The 2st entertime is: ', entertime )
                    res.render('enterscore', {
                        data : result[0], 
                        login : req.session.logined,
                        entertime : entertime
                    })
                }}
        )
    })  


    router.post('/enterscore', upload.single('_image'), function(req, res){
          if(!req.session.logined){
            res.redirect("/")
        }else{    
            const phone = req.session.logined.phone 
            //const entertime =req.body._time
            console.log('enterscore post entertime is: ', entertime )
            const user = req.session.logined.username
            const _golfsys = req.body.input_golfsys
            const _strok = req.body.input_strok  
            
            const _tokenamount = req.session.logined.charge_amount
            const tokenamount = parseInt(_tokenamount)+parseInt(-2000)      
            const _scorepicture = req.file.filename
            console.log('_scorepicture=',_scorepicture);
            const filename = _scorepicture;            
            // Save the file to the filesystem.
           // Create the directory if it does not exist
            if (!fs.existsSync('./public/uploads/')) {
                fs.mkdirSync('./public/uploads/');
            }

            // Check if the file exists
            if (req.file) {
                const filepath = './public/uploads/' + filename;
                console.log("filepath = ",filepath)
                const image = fs.readFileSync(filepath)
                // If the file exists, write it to the filesystem
                if (fs.existsSync(filepath)) {
                    // fs.writeFile(filepath,JSON.stringify(filepath), (err) => {
                        fs.writeFile(filepath,image, (err) => {
                        if (err) {
                            console.log(err);
                            res.send(err);
                        } else {
                            console.log('File saved successfully!');
                        }
                    });
                } else {
                    console.log('File does not exist!');
                }}

            const stroke =  _strok.toString()    
            console.log("entertime과 갱신내용 미리보기=", entertime, stroke, _scorepicture, )
            entertime11 = entertime

            const sql = `
                update
                score
                set
                golfsys=?,
                strok = ?,
                scorepicture = ?
                where
                entertime = ?
                `
            console.log("sql =" ,sql  )     
            const values = [_golfsys, stroke, _scorepicture, entertime11]
            connection.query(
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                    }else{
                        console.log("entertime으로 score 수정한 결과물", result)
                    }                 
                } 
            )

            //score출력을 위한 준비
            const sql2 = `
                select 
                *
                from 
                score
                where 
                phone = ?
            `
            const values2 = [phone]
            connection.query(
                sql, 
                values2, 
                function(err, result2){
                    if(err){
                        console.log(err)
                    }else{
                        console.log("score갯수: ", result2)
                        res.render('score_list', {
                            'resultt': result2,
                            'username' : user, 
                            'amount' : tokenamount,
                            'phone': req.session.logined.phone,
                            'login_data' : req.session.logined,                    
                            })
                        }
                    })

    }})


    router.get('/enterpay_list', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{    
            const phone = req.session.logined.phone 
            const user = req.session.logined.username   
            const amount = req.session.logined.charge_amount
            const sql = `
                        select 
                        *
                        from 
                        score
                        where 
                        phone = ?
                        ORDER BY strok ASC
                    `
            const values = [phone]
            connection.query(
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                    }else{
                        const _golfsys= result[0].golfsys
                        console.log("???stroke = ", result[0].strok)
                        let scores_sum = 0
                        let sc = scores_sum.toString()
                        let len =0
                        let scores 

                        if(result.length>=5){
                            len =5
                            }else{
                                len=result.length
                            }
                            
                            for(i=0;i<len;i++){
                                scores  =parseInt(result[i].strok)
                                scores_sum = scores_sum + scores
                                console.log("stroke = ", result[i].strok)
                                
                            }
                        console.log("scores_sum = ", scores_sum)
                        sc=scores_sum
                        console.log("result[0].golfsys",result[0].golfsys)

                        // ksfc에 기존 bestscore와 golfsys비교하여 조건에 맞으면 갱신
                        const sql = `
                            select 
                            *
                            from 
                            ksfc
                            where 
                            phone = ?
                                    `
                        const values = [phone]
                        connection.query(
                            sql, 
                            values, 
                            function(err, result2){
                                if(err){
                                    console.log(err)
                                }else{
                                    if(result2[0].bestscore > scores_sum){

                                         //대회모드에다 최고 기록 저장
                                        const sql = `
                                            update
                                            ksfc
                                            set
                                            bestscore=?
                                            where
                                            phone = ?`
                                        console.log("sql =" ,sql  )     
                                        const values = [scores_sum, phone]
                                        connection.query(
                                            sql, 
                                            values, 
                                            function(err, result3){
                                                if(err){
                                                    console.log(err)
                                                }else{
                                                    console.log("대회모드에다 최고 기록 저장완료 ", result3)
                                                
                                                    res.render('enterpay_list', {
                                                        'resultt': result,
                                                        'username' : user, 
                                                        'phone': phone,
                                                        'scores_sum' : sc,
                                                        'len': len,
                                                        'amount' :amount,
                                                        'sys':result2[0].golfsys
                                                       })                 
                                                    } 
                                                }
                                            )
                                        }else{
                                            console.log("대회모드에다 기록을 할 이유가 없음 저장" )
                                            res.render('enterpay_list', {
                                                'resultt': result,
                                                'username' : user, 
                                                'phone': phone,
                                                'scores_sum' : sc,
                                                'len': len,
                                                'amount' :amount,
                                                'sys':result2[0].golfsys
                                               })   
                                        }
                                    }}
                    )}          })       }       })

                    
    router.get('/enterpay', async (req, res)=>{
        if(!req.session.logined){
            let data=0
            res.render('login', {
                'state' : data
            })
        }else{
            const user = req.session.logined.username
            const phone = req.session.logined.phone 
            const balance = req.session.logined.charge_amount
            console.log('enterpay get req.session.logined.username= ', req.session.logined.username)
            const s = await req.body.state

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
                    }else{
                        res.render('enterpay', {
                            'resultt': result,
                            'username' : user, 
                            'amount' : balance,
                            'phone': phone,                
                            'state' : 0
                        })
                    }})

                }})


    router.post('/enterpay', async (req, res)=>{
        if(!req.session.logined){
            let data=0
            res.render('login', {
                'state' : data
                })
        }else{
            const input_numeric6 = await req.body._numeric6
            const _golfsys = await req.body.input_golfsys
            console.log("numeric6 =",input_numeric6)
            state = 0
            const _strok = 0
            const date =  moment()
            const _input_dt = date.format('YYYY-MM-DD HH:MM:SS')
            // const _input_dt = date.toLocaleString("ko-KR", {
            //     month: "2-digit",
            //     day: "2-digit",
            //     hour: "2-digit",
            //     minute: "2-digit",
            //     second: "2-digit"
            //   })
            const _phone =  req.session.logined.phone
            console.log("_phone=",_phone)
            const _username =  req.session.logined.username
            const _picture = ""
            console.log("amount=",req.session.logined.charge_amount)
            console.log("phone=",req.session.logined.phone)

            //비밀번호 맞는지 확인
            if(input_numeric6 != req.session.logined.numeric6){
                let da = 1
                res.render("enterpay",{
                    amount : req.session.logined.charge_amount,
                    username :_username,
                    state : da
                })
            }else{
                da = 0
                    
                //대회참가비 결제
                const balance = parseInt(req.session.logined.charge_amount)-2000
                console.log("참가비결제 결과 balance =",balance )

                //스코어리스트에 기록
                console.log("score에 기록하는 내용 = ",_input_dt, _phone, _username,  _strok , _picture )
                const sql=
                        `
                        insert 
                        into 
                        score 
                        values ( ?, ?, ?, ?, ? ,?)`

                const values = [_input_dt, _phone, _username, _golfsys, _strok , _picture]
                
                connection.query(
                    sql,
                    values,
                    (err, result)=>{
                        if(err){
                            console.log(result)
                            res.send(err)
                        }else{
                        console.log("result=",result)   
                        console.log("//대회참가비 결제 sucess")
                    }}
                    )

                //충전금액 수정        
                const _charge_amount =  balance
                console.log("참가비결제 결과수정 balance, _phone =",balance, _phone )  

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
                    function(err, result2){
                        if(err){
                            console.log(err)
                            res.send(err)
                            }
                        else{
                            console.log("//충전금액 수정 ")
                            console.log("req.session.logined= ",req.session.logined)
                            res.render("index",{
                                login_data : req.session.logined, 
                                amount :_charge_amount,
                                state:0                     
                                }) 
                            }
                        }
                )
            }
        }   
    })

    router.get('/gamepay_list', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{    
            const phone = req.session.logined.phone 
            // const add = req.session.logined.wallet
            const user = req.session.logined.username         
            // const token1 = req.session.logined.chagr_amount
            const tokenamount = req.session.logined.charge_amount
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
                    'amount':tokenamount,
                    'phone': req.session.logined.phone
                    })
            })
        }
})

    router.get('/gamepay', async (req, res)=>{
        if(!req.session.logined){
            let data=0
            res.render('login', {
                'state' : data
            })
        }else{
                // const wallet = req.session.logined.wallet
                const balance = req.session.logined.charge_amount
                const phone= req.body.phone
                const s = req.body.state
                res.render('gamepay', {
                    amount : balance,
                    phonenum : phone,
                    username : req.session.logined.username,
                    state : 0
                })
    }}) 

    router.post('/gamepay', async (req, res)=>{
        if(!req.session.logined){
            let data=0
            res.render('login', {
                'state' : data
                })
            }else{
                state = 0
                var storename=""
                const golfstore = await req.body.input_golfstore
                switch (golfstore) {
                        case "1":
                            console.log("바르셀로나 스크린")
                            storename = "바르셀로나 스크린"
                            break
                        case "2":
                            console.log("중앙자이언트 골프존파크")
                            storename = "중앙자이언트 골프존파크"
                            break
                        case "3":
                            console.log("XPGA 스크린")
                            storename = "XPGA 스크린"
                            break
                        case "4":
                            console.log("참조은 스크린")
                            storename = "참조은 스크린"
                            break
                        case "5":
                            console.log("창원케이골프클럽")
                           storename = "창원케이골프클럽"
                            break
                        case "6":
                            console.log("케이그라운드")
                            storename = "케이그라운드"
                            break
                        default:
                            console.log(" 1, 2, 3, 4,5,6 중 하나가 아닙니다");
                        }
                // const walletfrom = req.session.logined.wallet
                const pay_amount = await req.body._gamepayment
                console.log("gamepay_amount =", pay_amount  )
                const date = moment()
                const _input_dt = date.format("YYYY-MM-DD HH:MM:SS")
                const _phone =  req.session.logined.phone
                const _username = req.session.logined.username
                const _storename  = storename
                console.log("_storename =", _storename  )
                const balance = parseInt(req.session.logined.charge_amount) -  parseInt(pay_amount)
                console.log("balance =", balance  )
                var charge_amount= 0
                const numeric6 = await req.body._numeric6


                //비밀번호 맞는지 확인
                if( numeric6 != req.session.logined.numeric6){
                    let da = 1
                    res.render("gamepay",{
                        amount : req.session.logined.charge_amount,
                        username :_username,
                        state : da
                    })
                }else{
                    da = 0        
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
                                res.send(err)
                            }else{
                                console.log("상점 거래내역 기록= ",result)
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
                                        }else{  
                                            console.log("//기존 store amount select resultt=",result2) 
                                            console.log("result2[0].store_amount =",result2[0].store_amount)
                                            charge_amount = result2[0].store_amount+pay_amount
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
                                                    }else{
                                                        console.log("//store의 chage금액 수정=",charge_amount, _storename)
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
                                                        const values4 = [balance, _phone]
                                                        connection.query(
                                                            sql4, 
                                                            values4, 
                                                            function(err, result4){
                                                                if(err){
                                                                    console.log(err)
                                                                }else{
                                                                    console.log("로그인포테이블에 수정된 KPoint 갱신입력 성공",_charge_amount )
                                                                    //storpay_l
                                                                    const sql6 = `
                                                                            select 
                                                                            *
                                                                            from 
                                                                            store_pay
                                                                            where 
                                                                            phone = ?
                                                                            `
                                                                    const values6 = [_phone]
                                                                    connection.query(
                                                                        sql6, 
                                                                        values6, 
                                                                        function(err, result6){
                                                                            if(err){
                                                                                console.log(err)
                                                                            }else{  
                                                                                res.render("gamepay_list",{
                                                                                    login_data : req.session.logined,
                                                                                    username :  req.session.logined.username,
                                                                                    resultt :result6,
                                                                                    amount : balance
                                                                })}   
                                                            })
                                                                }}   
                                                        )
                                                    }}   
                                                )
                                            }
                                    }) 
                                }
                            }
                        )

                    res.render("index",{
                        login_data : req.session.logined,
                        username :  req.session.logined.username,
                        amount : balance
                    })
                }
            }
        })

    return router;
    }