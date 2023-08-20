// express를 사용하기 위하여 express 모듈을 로드 
const express = require('express')
const fs = require('fs')
// route부분이기 때문에 express.Router()
const router = express.Router()
const moment = require('moment')
const http = require('http');


// 파일 업로드를 사용하기위한 모듈
// const multer = require('multer')
// const storage = multer.diskStorage(
//     {
//         destination : function(req, file, cb){
//             cb(null, './public/uploads/')
//         }, 
//         filename : function(req, file, cb){
//             cb(null, file.originalname)
//         }
//     }
// )
// 유저가 보낸 파일을 저장할 위치를 설정
// const upload = multer({
//     storage : storage
// })

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

//js 파일 로드 
const kpoint = require("../token/kpoint")
const error = require("../token/error");

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
            //kpoint 최신자료 순 정렬
            console.log("kpoint 최신자료 순 정렬 (kp_list) ")
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
                    console.log("sort 결과 출력가능 ")
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
        const phone = await req.session.logined.phone

        if(!req.session.logined){
            res.redirect("/")
        }else{    
            console.log("//charge 테이블 최신자료 순으로 정렬")
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
                    }else{
                    console.log("result=", result)
                    console.log("result=", result.length) 
                    console.log("kp_amount =",    kp_amount)  
                    res.render('charge_list', {
                        'resultt': result,
                        'username' : user, 
                        'amount' :  kp_amount,
                        'phone': req.session.logined.phone
                        })}})}
})

    router.get('/charge', async (req, res)=>{
        let st=1
        if(!req.session.logined){
            res.redirect("/")
        }else{
            st=st+1
            const _phone=req.session.logined.phone
            const char=req.session.logined.charge_amount
            console.log("charge get단계")
            res.render("charge",{
                username:req.session.logined.username,
                amount:char,
                phone:_phone,
                st:st
            })

        }})

    router.post('/charge', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{
            console.log("charge 포스트 단계..........")

    }})      

    

          
    router.get('/score_list', async (req, res)=>{
        let data=0
        if(!req.session.logined){
            
            res.redirect("/")
        }else{   
           console.log("score_list스코어 출력 스코어 테이블 최근 순으로 정렬")
           const phone = req.session.logined.phone 
           const user = req.session.logined.username         
           const tokenamount = req.session.logined.charge_amount
           const _charge_amount = parseInt(tokenamount)
            //상위 5개 score출력을 위한 준비
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
                }else{
                     
                    console.log(result2.length)
                    // console.log("//상위 5개 score출력을 위한 준비: ", result2)
                    
                    let len=0
                    let sco_sum =0
                    
                    if(result2.length > 5){
                        len =5
                    }else{
                        len = result2.length
                    }
                    if(len>0){
                        data=1
                    }
                    console.log("len : ", len)
                    
                    for(var i=0; i<len; i++){
                        if(result2[i].strok!='9999'){
                        sco_sum = sco_sum + parseInt(result2[i].strok)
                        console.log("strok, sco_sum = ", result2[i].strok, sco_sum )
                        }
                    }
                    console.log("scores_sum=", sco_sum)
                    const scores_sum = sco_sum.toString()
                    
                    res.render('score_list', {
                        'resultt':result2,
                        'username' : user, 
                        'phone': phone,
                        'amount':req.session.logined.charge_amount,
                        'login_data' : req.session.logined,  
                        'scores_sum' : scores_sum,
                        'state':data,
                        'len': len           
                        })  
                    } })}})


 

    
            
router.get('/enterpay_list', async (req, res)=>{
    if(!req.session.logined){
        res.redirect("/")
        let data =0
    }else{ 
        data=1 
          
        const phone = req.session.logined.phone 
        const user = req.session.logined.username   
        const amount = req.session.logined.charge_amount

        //대회참가비 결제 리스트
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
                
            }else{
               
                //스코어가 하나도 없는 경우는
                console.log("//대회참가비 리스트result.length",result.length)
                if(result.length==0){
                    const st=1
                    //스코어가 하나도 없어서 
                    res.render("enterpay",{
                        state:0,
                        amount:amount,
                        phone:phone,
                        username:user
                        }) 
                    }else{

                 //참가시스템 검색
                        const sql2 = `
                            select 
                            * 
                            from 
                            ksfc 
                            where 
                            phone = ?
                                `
                        const values2 = [phone]

                        connection.query(
                            sql2, 
                            values2, 
                            function(err, result2){
                                if(err){
                                    console.log(err)
                                    res.send(err)
                                }else{
                                    console.log("result2",result2)
                                    res.render('enterpay_list', {
                                        ksfcres:result2,
                                        enterpay:result, 
                                        username : user, 
                                        amount : amount,
                                        phone: phone,
                                        login_data : req.session.logined,  
                    
                                    })}
                })}}})}})


//2000원 결제
router.get('/enterpay', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{
        //charge있나 확인
        const charge_amount = req.session.logined.charge_amount
        if(charge_amount<2000){

            //2000원 미만이면 충전하러
            res.render("charge",{
                st:0,
                username:req.session.logined.username,
                amount:charge_amount,
                phone:req.session.logined.phone
            })

        }else{
            //2000원 이상이면 결제시작
            const user = req.session.logined.username
            const phone = req.session.logined.phone 
            const balance = req.session.logined.charge_amount
            console.log('enterpay get req.session.logined.username= ', req.session.logined.username)
            const s = await req.body.state

            //결제비 리스트 출력 
            const sql2 = `
                select 
                *
                from 
                score
                where 
                phone = ?
                order by entertime ASC
                `
                const values2 = [phone]
                connection.query(
                sql2, 
                values2, 
                function(err, result2){
                    if(err){
                        console.log(err)            
                    }else{
                        console.log(result2.length)
                        res.render('enterpay', {
                            'resultt': result2,
                            'username' : user, 
                            'amount' : balance,
                            'phone': phone,                
                            'state' : 0
                        })
                    }})}}})

//2000원 결제
router.post('/enterpay', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
            })
    }else{
        let da =1          
        const input_numeric6 = await req.body._numeric6.trim()
        const _golfsys = ""
        console.log("numeric6 =",input_numeric6)
        const _strok = 9999
        const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')
        const phone =  req.session.logined.phone
        console.log("_phone=",phone)
        const _username =  req.session.logined.username
        // const ch =  req.session.logined.username
        const _picture = ""
        const balance=req.session.logined.charge_amount

        console.log("input_numeric6",input_numeric6)
        console.log("req.session.logined.numeric6=",req.session.logined.numeric6)

        //비밀번호 맞는지 확인
        if(input_numeric6 != req.session.logined.numeric6){
            da=0
            res.render("enterpay",{
                amount : balance,
                username :_username,
                state : da
            })
        }else{
            da=1
            const server = http.createServer((req, res) => {
                // Send a warning message
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.write('Warning: This is a test message.');
                res.end();
                })
            let price = 2000
            //대회참가비 결제
            // enterpay를 score에 기록
            kpoint.enterpay_score_insert(_input_dt, phone, _username, _golfsys, _strok , _picture)    
            
            //충전금액 수정 log-info       
            const balance = parseInt(req.session.logined.charge_amount)-price
            req.session.logined.charge_amount = balance 
            console.log("참가비결제 결과수정 balance, _phone =",balance, phone )  
            kpoint.log_info_amount_update(phone, balance )
            console.log("//충전금액(감액) 수정 ")
            
            //kp_list에 insert
            const trans_tp="festival"
            kpoint.kpoint_list_insert(phone, trans_tp,  _input_dt, price, balance)

            //결제비 리스트 출력 
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
            sql2, 
            values2, 
            function(err, result2){
                if(err){
                    console.log(err)            
                }else{
                    if(result2.length==0){//스코어가 하나도 없으면 다시 대회참가신청
                        res.render("enterpay",{
                            amount : balance,
                            username :_username,
                            state:0
                        })
                    }else{
                            // res.render('enterpay_list', {
                            //     'enterpay':result2,
                            //     'username' :  _username, 
                            //     'amount' : balance,
                            //     'phone': phone,
                            //     state: 0       
                            res.redirect("enterpay_list")        
                    // })
                }}})}}})
                   


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
        
            const balance = req.session.logined.charge_amount
            const phone = await req.body.phone
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
            state = 1
            var storename=""
            const golfstore = await req.body.input_golfstore.trim()
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
            const _storename  = storename
            console.log("_storename =", _storename  )

            //가맹점에 결제할 금액입력
            const pay_amount = await req.body._gamepayment.trim()
            console.log("gamepay_amount =", pay_amount  )

            //기존 나의 잔액확인
            const _charge_amount = req.session.logined.charge_amount
            
            //charge 잔액이 가맹점결제금액보다 작은지 확인
            if(_charge_amount<pay_amount){

                //2000원 미만이면 충전하러
                res.render("charge",{
                    st:0,
                    username:req.session.logined.username,
                    amount:_charge_amount,
                    phone:req.session.logined.phone
                })

            }else{
                //잔액이 부족하지 않으면
                const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')
                const _phone =  req.session.logined.phone
                const _username = req.session.logined.username
                const _charge =req.session.logined.charge_amount
                //비밀번호 맞는지 확인
                const numeric6 = await req.body._numeric6.trim()
                //비밀번호 틀리면 다시결제화면으로
                if( numeric6 != req.session.logined.numeric6){
                    let da = 0
                    res.render("gamepay",{
                        amount : _charge,
                        username :_username,
                        state : da
                    })
                }else{
                    da = 1 
                    //비밀번호 일치하면 가맹점거래리스트에 거래내역 추가 store_pay
                    // const pay=parseInt(pay_amount)*-1
                    kpoint.store_list_insert(_input_dt, _phone, _username, _storename, pay_amount  )       
                    
                    //가맹점에 입금된 금액 추가 계산 store
                    const sql = `
                        select 
                        *
                        from 
                        store
                        where 
                        storename = ?                        
                    `
                    const values = [ _storename ]
                    connection.query(
                        sql, 
                        values, 
                        function(err, result){
                            if(err){
                                console.log(err)
                            }else{ 
                            //가맹점 추가 금액 계산    
                            const _store_amount = parseInt(result[0].store_amount) + parseInt(pay_amount)
                            // const _store_amount = store_amount.toString()
                            console.log("가게의 어마운트(before)",result[0].store_amount, pay_amount)
                            console.log("가게의 어마운트(after)",_store_amount)
                            //가맹점 테이블 수정
                            kpoint.storeamount_update( _storename, _store_amount  )
                            
                            //log_info 금액 수정 log_info
                            const ch_amount = parseInt(_charge_amount) - parseInt(pay_amount)
                            kpoint.log_info_amount_update(_phone, ch_amount  )        
                            console.log("로그인포 테이블에 수정된 KPoint 갱신입력 성공",ch_amount  )
                            
                            //KP_list에 추가 all
                            const trans_tp = storename.toString()
                            kpoint.kpoint_list_insert(_phone, trans_tp,  _input_dt, pay_amount,ch_amount )

                            // res.render("gamepay_list",{
                            //     resultt :result,
                            //     amount :req.session.logined.charge_amount,
                            //     username:req.session.logined.username
                            //         } )
                                res.redirect("gamepay_list")
                    }})}}}})
                    

router.get('/gamepay_list', async (req, res)=>{
if(!req.session.logined){
    res.redirect("/")
    }else{  
        console.log("가맹점 거래내역보기 성공")  
        const phone = req.session.logined.phone 
        const user = req.session.logined.username         
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
                    console.log("가명점에 결제한 건수:  ", result.length)
                    res.render('gamepay_list', {
                        'resultt': result,
                        'username' : user, 
                        'amount':tokenamount,
                        'phone': req.session.logined.phone
            })}})
        }})

router.get('/kp_trans', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{
        data=1
        // const wallet = req.session.logined.wallet
        const balance = req.session.logined.charge_amount
        const _amount= req.session.logined.username
        const _phone= req.session.logined.phone
        const s = req.body.state
        
        res.render('kp_trans', {
            amount : balance,
            phonenum : _phone,
            username : _amount,
            state : 0
        })
    }}) 

router.post('/kp_trans', async (req, res)=>{
    if(!req.session.logined){
    let data=0
    res.render('login', {
        'state' : data
        })
    }else{
        data=1
        const receiptphone =await req.body._reciept.trim()//수신자폰

        const pay_amount = await req.body._sendpay.trim()//보낼금액
        console.log("transpay_amount =",pay_amount)
        // const date = moment()
        // const _input_dt = date 
        const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')//거래시간

        //보내는 사람의  정보
        const _phone =  req.session.logined.phone  
        const _username = req.session.logined.username
        const _charge_amount = req.session.logined.charge_amount
        
        //보내는 사람의 charge모지란지 확인
        if(_charge_amount<pay_amount){

            //거래금액 미만이면 충전하러 갈것
            res.render("charge",{
                st:0,
                username:req.session.logined.username,
                amount:_charge_amount,
                phone:req.session.logined.phone
            })

        }else{

            var charge_amount= 0
            var reciep_amount =0
            
            //비밀번호 맞는지 확인
            const numeric6 = await req.body._numeric6.trim()
            
            if( numeric6 != req.session.logined.numeric6){
                let da = 0
                res.render("kp_trans",{
                    username :_username,
                    amount:_charge_amount,
                    state : da
                })
        }else{
            //비밀번호 맞다면 거래
            da = 1 
            
            //log_info 정보(보내는 사람)
            charge_amount = parseInt(_charge_amount) - parseInt(pay_amount)//차감
            req.session.logined.charge_amount= charge_amount//차감계산된 금액으로 세션정보를 수정
            kpoint.log_info_amount_update(_phone, charge_amount   )        
            console.log("log_info테이블에 수정된 KPoint 갱신입력 성공",_phone, charge_amount  )
            
            //수신자의 전번
            const sql6 = `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                `
            const values6 = [ receiptphone]
            connection.query(
                sql6, 
                values6, 
                function(err, result6){
                    if(err){
                        console.log(err)
                    }else{ 
                        if(result6.length!=0){

                        //수신자 금액 정정 
                        console.log("&&&&&&&&&&&&&&&&&", receiptphone)
                        const reciept_amount = result6[0].charge_amount
            
                        reciep_amount = parseInt(reciept_amount) + parseInt(pay_amount)//수신 받은 금액 추가
                        console.log("수신받은 금액 추가계산한 것 원장 갱신입력",receiptphone, reciep_amount  )
                        kpoint.log_info_amount_update( receiptphone, reciep_amount)

                        //친구끼리 거래하기거래리스트에 거래내역 추가 
                        const rec_username= result6[0].username.toString()
                       
                        console.log("친구끼리 거래 리스트에 추가",_input_dt, _phone, rec_username, receiptphone, pay_amount )
                        kpoint.trans_list_insert(_input_dt, _phone, rec_username, receiptphone, pay_amount )


                        //송신자의 금액정정
                        const sql2 = `
                            select 
                            *
                            from 
                            log_info
                            where 
                            phone = ?
                            
                            `
                        const values2 = [ _phone]
                        connection.query(
                            sql2, 
                            values2, 
                            function(err, result2){
                                if(err){
                                    console.log(err)
                                }else{ 

                                    if(result2.length!=0){

                                        //친구에게 보내기 내역 기록
                                        //KP_list에 추가  //보내는 사람
                                        const trans_tp = _username//보내는 사람
                                        console.log("회원끼리의 거래내역을 kp_list에 insert",receiptphone, trans_tp,  _input_dt, pay_amount ,charge_amount) 
                                        const _pay_amount= parseInt(pay_amount)* -1
                                        kpoint.kpoint_list_insert(receiptphone, trans_tp,  _input_dt, _pay_amount ,charge_amount )
                                        
                                        // //KP_list에 추가 all(송신자)
                                        // const trans_tp1=rec_username//받는사람
                                        // send = parseInt(pay_amount)
                                        // const new_dt = moment(_input_dt).add(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
                                        // console.log("0.01초 더한시간",new_dt) 
                                        // kpoint.kpoint_list_insert(_phone, trans_tp1,  new_dt, send ,reciep_amount)

                                        if(!req.session.logined){
                                            res.redirect("/")
                                            }else{  
                                             
                                            const phone = req.session.logined.phone 
                                            const user = req.session.logined.username         
                                            const tokenamount = req.session.logined.charge_amount
                                            const sql = `
                                                select 
                                                *
                                                from 
                                                trans_pay
                                                where 
                                                sendphone = ?
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
                                                        res.render('transpay_list', {
                                                            'resultt': result,
                                                            'username' : user, 
                                                            'amount':tokenamount,
                                                            'phone': req.session.logined.phone
                                                })}})
                                            // res.redirect("transpay_list")
                                            }}
                    
            }})}}})}}}})


//kpoint trans list 
router.get('/transpay_list', async (req, res)=>{
if(!req.session.logined){
    res.redirect("/")
    }else{  
        console.log("회원끼리 거래내역보기 성공")  
        const phone = req.session.logined.phone 
        const user = req.session.logined.username         
        const tokenamount = req.session.logined.charge_amount
        const sql = `
            select 
            *
            from 
            trans_pay
            where 
            sendphone = ?
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
                    res.render('transpay_list', {
                        'resultt': result,
                        'username' : user, 
                        'amount':tokenamount,
                        'phone': req.session.logined.phone
                    })}
                 })
        }})




return router
}
