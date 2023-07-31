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
const kpoint = require("../token/kpoint")
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

    //Kpoint list 출력
    router.get('/kp_list', async (req, res)=>{
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
                    kp_list
                    where 
                    phone = ?
                    order by transtime DESC
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
                    res.render('kp_list', {
                        'resultt': result,
                        'username' : user, 
                        'amount' :  kp_amount,
                        'phone': req.session.logined.phone
                        })
            })
        }})

    
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
                    order by chargedate DESC
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
            console.log('get 휴대폰번호 : ', phone)
            const user = req.session.logined.username
           res.render('charge', {
                'phone' : req.session.logined.phone, 
                'username' : req.session.logined.username, 
                'amount' : req.session.logined.charge_amount
                })
            }
            })    

    router.post('/charge', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
            }else{
                res.redirect("../index")
            }})

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
                    order by entertime DESC
                `
            const values = [phone]
            connection.query(
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                    }
                    console.log("entertime=======>", result[0].entertime)
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

    router.get('/enterscore',async function(req, res){
        if(!req.session.logined){
            let data=0
            res.redirect("/")
        }else{
                       
            data=1
            const phone = req.session.logined.phone 
            const no = req.query.no
            const noo  = await req.body.noo
            console.log("req.body.no",no)
            const sql2 = `
                select 
                *
                from 
                score
                where 
                phone = ?
                order by strok ASC
                `
            const values2 = [phone]
            connection.query(
            sql2, 
            values2, 
            function(err, result2){
                if(err){
                    console.log(err)
                    let data=0
                }else{
                    //상위 5개 score출력을 위한 준비
                    data =1
                    let len=0
                    let sco_sum =0

                    if(result2.length > 5){
                        len =5
                    }else{
                        len =result2.length
                    }
                    console.log("len : ", len)
                    
                    for(var i=0; i<len; i++){
                        sco_sum = sco_sum + parseInt(result2[i].strok)
                        console.log("strok, sco_sum = ", result2[i].strok, sco_sum )
                    }
                    console.log("scores_sum=", sco_sum)
                    
                    const scores_sum=sco_sum.toString()
                    const user = req.session.logined.username

                    const entertime11 = result2[noo].entertime
                    console.log("내가 선택한 시간은 entertime :  ",entertime11)
                    console.log("내가 선택한 시간의 stroke :  ",result2[noo].strok)
                    const sql = `
                        select 
                        * 
                        from 
                        score 
                        where 
                        entertime = ?
                         `
                        // const values =[phone]
                        const values = [entertime11]

                        connection.query(
                            sql, 
                            values, 
                            function(err, result){
                                if(err){
                                    console.log(err)
                                    res.send(err)
                                }else{
                                    console.log("시간으로 찾은 레코드 :", result)
                                    console.log('The 2st entertime is: ', result[0].entertime)
                                    const entertime1 = result[0].entertime
                                    res.render('enterscore', {
                                        no:no,
                                        resultt : result2, 
                                        username:user,
                                        login_data : req.session.logined,
                                        timeresult:result[0],
                                        entertime : entertime1,
                                        len:len,
                                        scores_sum:scores_sum,
                                        state:data
                            })
                        }}
                    )}
                }) }})

    router.post('/enterscore', upload.single('_image'), function(req, res){
          if(!req.session.logined){
            res.redirect("/")
        }else{    
            const no = req.query.noo
            console.log("-------------req.body.no",no)
            const phone = req.session.logined.phone 
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
            
            let entert = moment()
            entert = req.body._time
            if (typeof entert == "object") {
                const entertime = entert.format("YY-MM-DD HH:MM:SS")
            } else {
                console.log("entert is not a moment object")
                }
            console.log("entert= req.body._time",entert)
            console.log("entertime과 갱신내용 미리보기=", entertime, stroke, _scorepicture )
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
            const values = [_golfsys, stroke, _scorepicture, entertime]
            connection.query(
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                    }else{
                        console.log("entertime으로 score 수정한 결과물", result)

                        //kpoint list에 기록
                        const trans_tp = "festival"
                        const enterkp =2000
                        const sql3 = `
                            insert 
                            into 
                            kp_list
                            values (?,?,?,?)
                            `
                        const values3 = [phone, entertime,trans_tp, enterkp ]
                        connection.query(
                            sql3, 
                            values3, 
                            function(err, result3){
                                if(err){
                                    console.log(err)
                                }else{
                                    console.log("kpoint list에 기록 정상")

                                    //score출력을 위한 준비
                                    const sql2 = `
                                    select 
                                    *
                                    from 
                                    score
                                    where 
                                    phone = ?
                                    order by entertime DESC
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
                })                                }
            })
            }                 
        } 
    )
    }})                                   

    router.get('/enterpay_list', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
            let data =0
        }else{ 
            data=1   
            const phone = req.session.logined.phone 
            const user = req.session.logined.username   
            const amount = req.session.logined.charge_amount
            
            console.log(" phone = ",phone)
            const sql2 = `
                select 
                *
                from 
                score
                where 
                phone = ?
                order by strok ASC
                `
            const values2 = [phone]
            connection.query(
            sql2, 
            values2, 
            function(err, result2){
                if(err){
                    console.log(err)
                    let data=0
                }else{
                    console.log("//상위 5개 score출력을 위한 준비")
                    //상위 5개 score출력을 위한 준비
                    const enterscore = result2

                    //score입력을 위한 준비(최근순)
                    //참가비결제를 위해 참가 list (최근순)
                    const sql = `
                        select 
                        *
                        from 
                        score
                        where 
                        phone = ?
                        order by entertime DESC
                        `
                    const values = [phone]
                    connection.query(
                    sql, 
                    values, 
                    function(err, result){
                        if(err){
                            console.log(err)
                            let data=0
                        }else{
                            data=1
                            let len=0
                            let sco_sum =0
                            const entertime_desc = result
                            console.log("entertime_desc: ",  entertime_desc.length)
                            console.log("enterpay_score( phone ): ",  enterscore.length)

                            if(enterscore.length > 5){
                                len =5
                            }else{
                                len = enterscore.length
                            }
                            console.log("len : ", len)
                            
                            for(var i=0; i<len; i++){
                                sco_sum = sco_sum + parseInt(enterscore[i].strok)
                                console.log("strok, sco_sum = ", enterscore[i].strok, sco_sum )
                            }
                            console.log("scores_sum=", sco_sum)
                            const scores_sum=sco_sum.toString()
                            
                            res.render('enterpay_list', {
                                    'resulttime': entertime_desc,
                                    'resultt':enterscore,
                                    'username' : user, 
                                    'amount' : amount,
                                    'phone': phone,
                                    'login_data' : req.session.logined,  
                                    'state':data ,
                                    'scores_sum' : sco_sum,
                                    'len': len           
                                    })  
            }})}})}})

    router.post('/enterpay_list', async (req, res)=>{
        if(!req.session.logined){
            
            res.redirect("/")
        }else{ 
            const _entertime = await req.body._time
            console.log("###########################리스트 중 시간 선택  req.body._time",_entertime )
            //상위 5개 score출력을 위한 준비
            const sql = `
                select 
                *
                from 
                score
                where 
                _entertime = ?
                `
            const values = [phone]
            connection.query(
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                        let data=0
                    }else{
                    //상위 5개 score출력을 위한 준비
                    data =1
                    const entersc =enterpay_score( phone)
                    
                    let len=0
                    let sco_sum =0
                    console.log("enterpay_score: ",entersc )

                    if(entersc.length > 5){
                        len =5
                    }else{
                        len =entersc.length
                    }
                    console.log("len : ", len)
                    
                    for(var i=0; i<len; i++){
                        sco_sum = sco_sum + parseInt(entersc[i].strok)
                        console.log("strok, sco_sum = ", entersc[i].strok, sco_sum )
                    }
                    console.log("scores_sum=", sco_sum)
                    const scores_sum=sco_sum.toString()
                    const user=req.session.logined.username

                    res.render('enterscore', {
                        'sate':data,
                        'entertime':_entertime,
                        'username' : user, 
                        'phone': phone,
                        'resultt': entersc,
                        'username' : user, 
                        'amount' : amount,
                        'login_data' : req.session.logined,  
                        'scores_sum' : scores_sum,
                        'len': len
                    })  
                }}
            )}})
    
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

            const result_enterpayselect = kpoint.enterpay_time( phone)
            res.render('enterpay', {
                'resultt': result_enterpayselect,
                'username' : user, 
                'amount' : balance,
                'phone': phone,                
                'state' : 0
            })
                    }})

    //2000원 결제
    router.post('/enterpay', async (req, res)=>{
        if(!req.session.logined){
            let data=0
            res.render('login', {
                'state' : data
                })
        }else{
            const input_numeric6 = await req.body._numeric6
            const _golfsys = ""
            console.log("numeric6 =",input_numeric6)
            state = 0
            const _strok = 0
            const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')
            const _phone =  req.session.logined.phone
            console.log("_phone=",_phone)
            const _username =  req.session.logined.username
            const _picture = ""
            console.log("input_numeric6",input_numeric6)
            console.log("req.session.logined.numeric6=",req.session.logined.numeric6)

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
                console.log("score에 기록하는 내용 = ",_input_dt, _phone, _username, _golfsys,  _strok , _picture )
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

                            //충전금액 수정        
                            const _charge_amount =  balance
                            req.session.logined.charge_amount =  _charge_amount
                            console.log("참가비결제 결과수정 balance, _phone =",balance, _phone )  

                            kpoint.log_info_amount_update(_phone, balance )
                            console.log("//충전금액(감액) 수정 ")

                            const result_enterpayselect = kpoint.enterpay_time( _phone)
                            res.render('enterpay', {
                                'resultt': result_enterpayselect,
                                'username' :  _username, 
                                'amount' : balance,
                                'phone': _phone,                
                                'state' : 0,
                                'login_data' : req.session.logined
                            })}})
                }}} ) 

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
                    order by transdate DESC
                `
            const values = [phone]
            connection.query(
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                    }else{     
                        res.render('gamepay_list', {
                            'resultt': result,
                            'username' : user, 
                            'amount':tokenamount,
                            'phone': req.session.logined.phone
                })
        }})}})

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
                // const date = moment()
                // const _input_dt = date 
                const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')
                const _phone =  req.session.logined.phone
                const _username = req.session.logined.username
                const _charge_amount = req.session.logined.charge_amount
                const _storename  = storename
                console.log("_storename =", _storename  )

                var store_amount= 0
                var charge_amount =0

                //비밀번호 맞는지 확인
                const numeric6 = await req.body._numeric6
                
                if( numeric6 != req.session.logined.numeric6){
                    let da = 1
                    res.render("gamepay",{
                        amount : req.session.logined.charge_amount,
                        username :_username,
                        state : da
                    })
                }else{
                    da = 0 
                    //비밀번호 일치하면 가맹점거래리스트에 거래내역 추가 store_pay
                    const storeamount = kpoint.store_list_insert(_input_dt, _phone, _username, _storename, pay_amount )       
                    console.log("result2[0].store_amount =",storeamount[0])
                    const store_charge =storeamount[0]

                    //가맹점에 입금된 금액 추가 계산 store
                    store_amount = parseInt(store_charge) + parseInt(pay_amount)
                    kpoint.storeamount_update( _storename, store_amount  )
                    
                    //log_info 충전금액 수정 log_info
                    ch_amount = parseInt(_charge_amount) + parseInt(pay_amount)
                    kpoint.log_info_amount_update(_phone, ch_amount  )        
                    console.log("로그인포테이블에 수정된 KPoint 갱신입력 성공",charge_amount  )
                    
                    //KP_list에 추가 all
                    const trans_tp="store"
                    kpoint.kpoint_list_insert(_phone, trans_tp,  _input_dt, pay_amount )
                    
                    //kpoint list에 기록                                                    
                    const sql6 = `
                        select 
                        *
                        from 
                        store_pay
                        where 
                        phone = ?
                        order by transdate DESC
                    `
                    const values6 = [_phone]
                    connection.query(
                        sql6, 
                        values6, 
                        function(err, result6){
                            if(err){
                                console.log(err)
                            }else{  
                                  
                                 console.log("kpoint list에 기록 정상")
                    
                                 res.render("gamepay_list",{
                                     login_data : req.session.logined,
                                     username :  req.session.logined.username,
                                     amount : ch_amount,
                                     resultt :result6,
                                     amount : store_amount
                                 }
                    )}} ) }}})

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
                                    order by transdate DESC
                                `
                            const values = [phone]
                            connection.query(
                                sql, 
                                values, 
                                function(err, result){
                                    if(err){
                                        console.log(err)
                                    }else{     
                                        res.render('gamepay_list', {
                                            'resultt': result,
                                            'username' : user, 
                                            'amount':tokenamount,
                                            'phone': req.session.logined.phone
                                })
                        }})}})
                
                    router.get('/trans_pay', async (req, res)=>{
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
                                
                                res.render('trans_pay', {
                                    amount : balance,
                                    phonenum : phone,
                                    username : req.session.logined.username,
                                    state : 0
                                })
                    }}) 
                
                    router.post('/trans_pay', async (req, res)=>{
                        if(!req.session.logined){
                            let data=0
                            res.render('login', {
                                'state' : data
                                })
                            }else{
                                state = 0
                                const receiptphone =await req.body._reciept
                        
                                const pay_amount = await req.body._sendpay
                                console.log("gamepay_amount =",pay_amount)
                                // const date = moment()
                                // const _input_dt = date 
                                const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')
                                const _phone =  req.session.logined.phone
                                const _username = req.session.logined.username
                                const _charge_amount = req.session.logined.charge_amount
                
                                var store_amount= 0
                                var charge_amount =0
                
                                //비밀번호 맞는지 확인
                                const numeric6 = await req.body._numeric6
                                
                                if( numeric6 != req.session.logined.numeric6){
                                    let da = 1
                                    res.render("trans_pay",{
                                        username :_username,
                                        amount:_charge_amount,
                                        state : da
                                    })
                                }else{
                                    da = 0 
                                    //비밀번호 일치하면 선물하기거래리스트에 거래내역 추가 store_pay
                                    const storeamount = kpoint.store_list_insert(_input_dt, _phone, _username, receiptphone, pay_amount )       
                                    console.log("result2[0].store_amount =",storeamount[0])
                                    const store_charge =storeamount[0]
                
                                    //가맹점에 입금된 금액 추가 계산 store
                                    store_amount = parseInt(store_charge) + parseInt(pay_amount)
                                    kpoint.storeamount_update( _storename, store_amount  )
                                    
                                    //log_info 충전금액 수정 log_info
                                    ch_amount = parseInt(_charge_amount) + parseInt(pay_amount)
                                    kpoint.log_info_amount_update(_phone, ch_amount  )        
                                    console.log("로그인포테이블에 수정된 KPoint 갱신입력 성공",charge_amount  )
                                    
                                    //KP_list에 추가 all
                                    const trans_tp="store"
                                    kpoint.kpoint_list_insert(_phone, trans_tp,  _input_dt, pay_amount )
                                    
                                    //kpoint list에 기록                                                    
                                    const sql6 = `
                                        select 
                                        *
                                        from 
                                        trans_pay
                                        where 
                                        phone = ?
                                        order by transdate DESC
                                    `
                                    const values6 = [_phone]
                                    connection.query(
                                        sql6, 
                                        values6, 
                                        function(err, result6){
                                            if(err){
                                                console.log(err)
                                            }else{  
                                                  
                                                 console.log("kpoint list에 기록 정상")
                                    
                                                 res.render("transpay_list",{
                                                     login_data : req.session.logined,
                                                     username :  req.session.logined.username,
                                                     amount : ch_amount,
                                                     resultt :result6,
                                                     amount : store_amount
                                                 }
                                    )}} ) }}})
    return router
}
    