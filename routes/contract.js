// express를 사용하기 위하여 express 모듈을 로드 
const express = require('express')
const fs = require('fs')
// route부분이기 때문에 express.Router()
const router = express.Router()
const moment = require('moment')
const http = require('http');

// Twilio에 연결합니다
const twilioClient = require('twilio')(process.env.accountSid, process.env.authToken)

const session = require('express-session')
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


module.exports = ()=>{


    router.get("/", async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{
            //원장읽어오기
            const phone = req.session.logined.phone 
            const sql =
                `
                select 
                *
                from 
                log_info
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
                    req.session.logined=result[0]
                    res.render('index', {                        
                        login_data : req.session.logined, 
                        balance : result[0].charge_amount
                    })
                }
            })
        }})

    //Kpoint list 출력
    router.get('/kp_list', async (req, res)=>{
       
        if(!req.session.logined){
            res.redirect("/")
        }else{    
            const user = req.session.logined.username
            const kp_amount = req.session.logined.charge_amount   
            const phone = req.session.logined.phone 

            //kpoint 최신자료 순 정렬
            console.log("kpoint 최신자료 순 정렬 (kp_list) ")
            const sql =
                `
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
                        'amount' : result[0].charge_amount,
                        'phone': phone
                        })
            })
        }})

    
    router.get('/charge_list', async (req, res)=>{

        if(!req.session.logined){
            res.redirect("/")
        }else{    
            // const user = req.session.logined.username
            // const kp_amount = req.session.logined.charge_amount   
            // const phone = req.session.logined.phone



            //원장읽어오기
            const phone = req.session.logined.phone 
            const sql7 =
                `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                
                    `
            const values7 = [phone]
            connection.query(
            sql7, 
            values7, 
            function(err, result7){
                if(err){
                    console.log(err)
                }else{
                    req.session.logined=result7[0]
                   
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
                             
                            res.render('charge_list', {
                                'resultt': result,
                                'username' :result7[0].username, 
                                'amount' : result7[0].charge_amount,
                                'phone': req.session.logined.phone
                                })
                            }})
                }})
            }})



 //골프장갑 카드결제==========================================   
    router.get('/card_pay_gloves', async (req, res)=>{
        let st=1
        if(!req.session.logined){
            res.redirect("/")
        }else{
                // 유저가 결재한 금액과 폰번호
            const card = req.query.card
            const phone = req.session.logined.phone
            const name=req.query.name
            st=st+1
            console.log("card 결제단계===>", card)

            //원장을 다시 읽을 준비
                
            console.log('cardpay==============',card )   
            console.log('phone ==============',phone )   
            console.log('product name ==============',name )  
            const login_data = req.session.logined
            
                
            //원장을 다시 읽어서 렌더링
            const sql = `
                select 
                *
                from 
                gloves
                where 
                name = ?
                `
            const values = [name]
            connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log(err)
                    
                }else{
                    if(result.length != 0){
                        

                        req.session.save()
                        res.render('card_pay_gloves', {
                            filename:result[0].filename,
                            name:result[0].name,
                            cardpay:card,
                            login_data: req.session.logined, 
                            username:req.session.logined.username,
                            amount:req.session.logined.charge_amount,
                            phone:phone,
                            card:card,
                            st:st
                    })
    }}})}}) 



    router.post('/card_pay_gloves', async function(req, res){
        
        if(!req.session.logined){
            let data=0
            res.render('login', {
                'state' : data
            })
        }else{
            const input_post =  req.body.input_post 
            const input_paymethod =   req.body.input_paymethod 
            const input_username  =  req.body.input_username
            const phone  =  req.session.logined.phone
            const card =req.body.price
            console.log("신용카드 결제대금 =", card)
            const sql5 =
                `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                
                    `
            const values5 = [phone]
            connection.query(
            sql5, 
            values5, 
            function(err, result5){
                if(err){
                    console.log(err)
                }else{

                    const amount=result5[0].charge_amount
    
                    
                    const name  =  req.query.name
                    

                    const sql6 =
                        `
                        select 
                        *
                        from 
                        gloves
                        where 
                        name = ?
                        
                            `
                    const values6 = [name]
                    connection.query(
                    sql6, 
                    values6, 
                    function(err, result6){
                        if(err){
                            console.log(err)
                        }else{
                            const price=result6[0].hap
                            const kpoint =result6[0].kpoint
                            // const card = result6[0].card
                            const filename = result6[0].filename
                            const filename_detail = result6[0].filename_detail
                            var bank=0 
                            if(input_paymethod=="KPoint포함(무통장입금)"){
                                
                                bank = parseInt(price) - parseInt(kpoint) 
                            }else{
                                if(input_paymethod=="무통장입금"){
                                    bank = price
                                    
                                }else{
                                    bank=0
                                }
                            }
                            
                            res.render('card_pay_gloves', {

                                post:input_post,
                                paymethod:input_paymethod,
                                phone: phone,
                                card:card,
                                bank:bank ,
                                filename:filename,
                                filename_detail:filename_detail,
                                username :input_username,
                                productname: name,
                                price:price,
                                kpoint:kpoint,
                                amount:amount
                            
                    })}})
    }})}})

//기기ㅏ골프 카드결제
    router.get('/card_pay', async (req, res)=>{
        let st=1
        if(!req.session.logined){
            res.redirect("/")
        }else{
             // 유저가 결재한 금액과 폰번호
            const price = req.query.card
            const phone = req.session.logined.phone
            const name=req.query.name
            st=st+1
            console.log("card 결제단계")

            //원장을 다시 읽을 준비
             
            console.log('cardpay==============',price )   
            console.log('phone ==============',phone )   
            console.log('product name ==============',name )  
            const login_data = req.session.logined
            
                
            //원장을 다시 읽어서 렌더링
            const sql = `
                select 
                *
                from 
                giga
                where 
                name = ?
                `
            const values = [name]
            connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log(err)
                    
                }else{
                    if(result.length != 0){
                        

                        req.session.save()
                        res.render('card_pay', {
                            filename:result[0].filename,
                            name:result[0].name,
                            card:price,
                            login_data: req.session.logined, 
                            username:req.session.logined.username,
                            amount:req.session.logined.charge_amount,
                            phone:phone,
                            st:st
                    })
    }}})}}) 

   
    router.post('/card_pay', async function(req, res){
     
        if(!req.session.logined){
            let data=0
            res.render('login', {
                'state' : data
            })
        }else{
            const input_post =  req.body.input_post 
            const input_paymethod =   req.body.input_paymethod 
            console.log("input_paymethod = ", input_paymethod )
            const input_username  =  req.body.input_username
            const phone  =  req.session.logined.phone
            const input_card =req.body.price
            console.log("input_card = ", input_card  )
            const sql5 =
                `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                
                    `
            const values5 = [phone]
            connection.query(
            sql5, 
            values5, 
            function(err, result5){
                if(err){
                    console.log(err)
                }else{

                    const amount=result5[0].charge_amount
 
                    
                    const name  =  req.query.name
                     

                    const sql6 =
                        `
                        select 
                        *
                        from 
                        giga
                        where 
                        name = ?
                        
                            `
                    const values6 = [name]
                    connection.query(
                    sql6, 
                    values6, 
                    function(err, result6){
                        if(err){
                            console.log(err)
                        }else{
                            const price=result6[0].hap
                            const kpoint =result6[0].kpoint
                            // const card = result6[0].card
                            const filename = result6[0].filename
                            const filename_detail = result6[0].filename_detail
                            var bank=0 
                            if(input_paymethod=="KPoint포함(무통장입금)"){
                                
                                bank = parseInt(price) - parseInt(kpoint) 
                            }else{
                                if(input_paymethod=="무통장입금"){
                                    bank = price
                                    
                                }else{
                                    bank=0
                                }
                            }
                            
                            res.render('card_pay', {

                                post:input_post,
                                paymethod:input_paymethod,
                                phone: phone,
                                card:input_card,
                                bank:bank ,
                                filename:filename,
                                filename_detail:filename_detail,
                                username :input_username,
                                productname: name,
                                price:price,
                                kpoint:kpoint,
                                amount:amount
                            
                    })}})
    }})}})


    router.post('/cardpay', async function(req, res){
     
        // 유저가 결재한 금액과 폰번호
        const price = req.query.price
        const phone= req.query.phone

        console.log(" 유저가 결재한 금액   price=", price)   
         
        if(req.method == 'POST'){
            if(req.body.pay_state.trim()!=4){
                switch (req.body.pay_state.trim()){
                    case 1:
                        console.log("요청만 되었고 완료가 안됨 ")
                        break
                    case 8:
                    case 16:
                    case 32:
                        console.log("요청취소 ")
                        break
                    case 9:
                    case 64:
                        console.log("승인취소 ")
                    default:
                        break
                    }
                }else{

                    console.log("승인 완료 ")

                        //쇼핑한 사람에게 안내 메세지
                        const gphone = "+82"+ phone
                        console.log("결제한사람 폰 =",gphone)
                        
                        twilioClient.messages.create({
                            body: '케이그라운드와 함께 해주셔서 감사합니다.쇼핑몰 결제완료:    ' +  price ,
                            from: process.env.kphonenumber,
                            to: gphone
                            })
                            .then(message => console.log("card pay ment ok(kground)----", gphone,message.sid))

                        

                        //본사에 충전메세지
                        const ggphone = "+8201025961010" 
                        console.log(" 본사 폰  =",ggphone)
                        // 문자인증 코드를 생성합니다.
                        // 랜덤으로 4자리 인증 코드를 만든다.
                        
                        console.log("process.env.kphonenumber=",process.env.kphonenumber)
                
                        twilioClient.messages.create({
                            body: phone +'카드결제 완료(페이앱):   ' +  price ,
                            from: process.env.kphonenumber,
                            to: ggphone
                            })
                            .then(message => console.log("card pay ment ok(----",ggphone, message.sid))
                            
                        
                        console.log("현재 경로",__dirname)
                        res.render('index',{
                            login_data:req.session.logined,
                            amount:req.session.logined.charge_amount,
                        })     
                    }     

        }}
    )




    router.get('/charge', async (req, res)=>{
        let st=1
        if(!req.session.logined){
            res.redirect("/")
        }else{
            st=st+1
            console.log("charge get단계")

            //원장을 다시 읽을 준비
            const phone=req.session.logined.phone
            const login_data = req.session.logined
            console.log('로그인 되었어요 원장다시 읽기준비')   
             
            //원장을 다시 읽어서 렌더링
            const sql = `
                select 
                *
                from 
                log_info
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
                    if(result.length != 0){
                        // 로그인이 성공하는 조건
                        console.log('db에 로그인한 정보 result[0]', result[0],login_data)
                        console.log('db에 로그인한 정보login_data', login_data)
                        
                        console.log("charge refresh -->  ",result[0].charge_amount)
                        req.session.save()
                        res.render('charge', {
                            login_data: req.session.logined, 
                            username:result[0].username,
                            amount:result[0].charge_amount,
                            phone:result[0].phone,
                            st:st
                    })
                }}})}}) 



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


                    const sql6 = `
                                select 
                                *
                                from 
                                kp_list
                                where 
                                phone = ? && transtype="festival"
                                
                                `
                            const values6 = [phone]
                            connection.query(
                            sql6, 
                            values6, 
                            function(err, result6){
                                if(err){
                                    console.log(err)
                                }else{
                                                
                    res.render('score_list', {
                        result6:result6,
                        'resultt':result2,
                        'username' : user, 
                        'phone': phone,
                        'amount':req.session.logined.charge_amount,
                        'login_data' : req.session.logined,  
                        'scores_sum' : scores_sum,
                        'state':data,
                        'len': len           
                        })  }})  
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

         //원장읽어오기
         const phone = req.session.logined.phone 
         const sql7 =
             `
             select 
             *
             from 
             log_info
             where 
             phone = ?
             
                 `
         const values7 = [phone]
         connection.query(
         sql7, 
         values7, 
         function(err, result7){
             if(err){
                 console.log(err)
             }else{
                 req.session.logined=result7[0]
                
                //charge있나 확인
                const charge_amount = result7[0].charge_amount
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
                                })}})
                    }}})}})

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
        console.log("input numeric6 =",input_numeric6)
        const _strok = 9999
        const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')
        const phone =  req.session.logined.phone
        console.log("_phone=",phone)
        const _username =  req.session.logined.username
        // const ch =  req.session.logined.username
        const _picture = ""
        const balance=req.session.logined.charge_amount


        const sql2 = `
            select 
            *
            from 
            log_info
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
            }else{
                console.log("numeric6=",result2[0].numeric6)
                if(result2[0].numeric6==""){
                    res.render("auth6",{
                        username:_username,
                        amount : balance,
                        phone:phone
                    })
                }else{
               
                //비밀번호 맞는지 확인
                if(input_numeric6 != result2[0].numeric6){
                    da=0
                    res.render("enterpay",{
                        
                        'phone': phone,                
                        amount : balance,
                        username :_username,
                        state : da
                    })
                }else{
                    da=1
                    const price = "2000"
                    
                    //대회참가비 결제----------------------------------마이너스(2000원)
                    // 1. enterpay를 score에 기록
                    kpoint.enterpay_score_insert(_input_dt, phone, _username, _golfsys, _strok , _picture )    
                    
                     //3. kp_list에 insert
                     const trans_tp="festival"
                     kpoint.kpoint_list_insert_m(phone, trans_tp,  _input_dt, price )
                    
                    //2. 나의 충전금액 수정 log-info       
                
                    const kphone="01037248010"
                    kpoint.log_info_amount_update1(phone, price )//감액
                    kpoint.log_info_amount_update2(kphone, price )//증액

                    res.redirect("enterpay_list")        
                            
                        }}}})}})                        


router.get('/gamepay_list', async (req, res)=>{
    if(!req.session.logined){
        res.redirect("/")
    }else{    

         //원장읽어오기
         const phone = req.session.logined.phone 
         const sql7 =
             `
             select 
             *
             from 
             log_info
             where 
             phone = ?
             
                 `
         const values7 = [phone]
         connection.query(
         sql7, 
         values7, 
         function(err, result7){
             if(err){
                 console.log(err)
             }else{
                 req.session.logined=result7[0]
                 
                const phone = req.session.logined.phone 
                const user = req.session.logined.username         
                const tokenamount = result7[0].charge_amount

                //가맹점 거래내역
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
            }})}})}})



    router.get('/gameang', async (req, res)=>{
        if(!req.session.logined){
            let data=0
            res.render('login', {
                'state' : data
            })
        }else{
                //원장읽어오기
                const phone = req.session.logined.phone 
                const sql7 =
                    `
                    select 
                    *
                    from 
                    log_info
                    where 
                    phone = ?
                    
                        `
                const values7 = [phone]
                connection.query(
                sql7, 
                values7, 
                function(err, result7){
                    if(err){
                        console.log(err)
                    }else{
                        req.session.logined=result7[0]
                    
                    const balance = result7[0].charge_amount
                    const phone = req.body.phone
                    const s = req.body.state 
                
                    res.render('gameang', {
                        amount : balance,
                        phonenum : phone,
                        username : req.session.logined.username,
                        state : 0
                    })}})
}}) 


router.get('/gam_7', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{
            //원장읽어오기
            const phone = req.session.logined.phone 
            const sql7 =
                `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                
                    `
            const values7 = [phone]
            connection.query(
            sql7, 
            values7, 
            function(err, result7){
                if(err){
                    console.log(err)
                }else{
                    req.session.logined=result7[0]
                
                const balance = result7[0].charge_amount
                const phone = req.body.phone
                const _storename  = "등촌생고기"
                const _storephone  = "01072812508"
                console.log("_storename =", _storename  )
            
                res.render('gamepay', {
                    amount : balance,
                    phonenum : phone,
                    username :result7[0].username,
                    storename: _storename,
                    storephone: _storephone,
                    state : 0
                })}})
    }}) 


router.get('/gam_6', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{
            //원장읽어오기
            const phone = req.session.logined.phone 
            const sql7 =
                `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                
                    `
            const values7 = [phone]
            connection.query(
            sql7, 
            values7, 
            function(err, result7){
                if(err){
                    console.log(err)
                }else{
                    req.session.logined=result7[0]
                
                const balance = result7[0].charge_amount
                const phone = req.body.phone
                const _storename  = "케이그라운드"
                const _storephone  = "01037248010"
                console.log("_storename =", _storename  )
            
                res.render('gamepay', {
                    amount : balance,
                    phonenum : phone,
                    username :result7[0].username,
                    storename: _storename,
                    storephone: _storephone,
                    state : 0
                })}})
    }}) 


router.get('/gam_5', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{
            //원장읽어오기
            const phone = req.session.logined.phone 
            const sql7 =
                `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                
                    `
            const values7 = [phone]
            connection.query(
            sql7, 
            values7, 
            function(err, result7){
                if(err){
                    console.log(err)
                }else{
                    req.session.logined=result7[0]
                
                const balance = result7[0].charge_amount
                const phone = req.body.phone
                const _storename  = "참조은 스크린"
                const _storephone  = "01051641020"
                console.log("_storename =", _storename  )
            
                res.render('gamepay', {
                    amount : balance,
                    phonenum : phone,
                    username :result7[0].username,
                    storename: _storename,
                    storephone: _storephone,
                    state : 0
                })}})
    }}) 

router.get('/gam_4', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{
            //원장읽어오기
            const phone = req.session.logined.phone 
            const sql7 =
                `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                
                    `
            const values7 = [phone]
            connection.query(
            sql7, 
            values7, 
            function(err, result7){
                if(err){
                    console.log(err)
                }else{
                    req.session.logined=result7[0]
                
                const balance = result7[0].charge_amount
                const phone = req.body.phone
                const _storename  = "중앙자이언트 골프존파크"
                const _storephone  = "01085468481"
                console.log("_storename =", _storename  )
            
                res.render('gamepay', {
                    amount : balance,
                    phonenum : phone,
                    username :result7[0].username,
                    storename: _storename,
                    storephone: _storephone,
                    state : 0
                })}})
    }}) 


router.get('/gam_3', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{
            //원장읽어오기
            const phone = req.session.logined.phone 
            const sql7 =
                `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                
                    `
            const values7 = [phone]
            connection.query(
            sql7, 
            values7, 
            function(err, result7){
                if(err){
                    console.log(err)
                }else{
                    req.session.logined=result7[0]
                
                const balance = result7[0].charge_amount
                const phone = req.body.phone
                const _storename  = "XPGA 스크린"
                const _storephone  = "01026425995"
                console.log("_storename =", _storename  )
            
                res.render('gamepay', {
                    amount : balance,
                    phonenum : phone,
                    username :result7[0].username,
                    storename: _storename,
                    storephone: _storephone,
                    state : 0
                })}})
    }}) 


router.get('/gam_2', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{
            //원장읽어오기
            const phone = req.session.logined.phone 
            const sql7 =
                `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                
                    `
            const values7 = [phone]
            connection.query(
            sql7, 
            values7, 
            function(err, result7){
                if(err){
                    console.log(err)
                }else{
                    req.session.logined=result7[0]
                
                const balance = result7[0].charge_amount
                const phone = req.body.phone
                const _storename  = "바르셀로나 스크린"
                const _storephone  = "01049564241"
                console.log("_storename =", _storename  )
            
                res.render('gamepay', {
                    amount : balance,
                    phonenum : phone,
                    username :result7[0].username,
                    storename: _storename,
                    storephone: _storephone,
                    state : 0
                })}})
    }}) 


router.get('/gam_1', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{
            //원장읽어오기
            const phone = req.session.logined.phone 
            const sql7 =
                `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                
                    `
            const values7 = [phone]
            connection.query(
            sql7, 
            values7, 
            function(err, result7){
                if(err){
                    console.log(err)
                }else{
                    req.session.logined=result7[0]
                
                const balance = result7[0].charge_amount
                const phone = req.body.phone
                const _storename  = "창원케이골프클럽"
                const _storephone  = "01056941680"
                console.log("_storename =", _storename  )
            
                res.render('gamepay', {
                    amount : balance,
                    phonenum : phone,
                    username :result7[0].username,
                    storename: _storename,
                    storephone: _storephone,
                    state : 0
                })}})
    }}) 


router.get('/gamepay', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{
         //원장읽어오기
         const phone = req.session.logined.phone 
         const sql7 =
             `
             select 
             *
             from 
             log_info
             where 
             phone = ?
             
                 `
         const values7 = [phone]
         connection.query(
         sql7, 
         values7, 
         function(err, result7){
             if(err){
                 console.log(err)
             }else{
                 req.session.logined=result7[0]
                
                const balance = result7[0].charge_amount
                const phone = req.body.phone
                const s = req.body.state 
            
                res.render('gamepay', {
                    amount : balance,
                    phonenum : phone,
                    username : req.session.logined.username,
                    state : 0
                })}})
    }}) 


//가맹점 결제
router.post('/gamepay', async (req, res)=>{
if(!req.session.logined){
    let data=0
    res.render('login', {
        'state' : data
        })
}else{
    //가맹점에 결제할 금액입력받음
    const _phone =  req.session.logined.phone
    const _storename = req.body.input_storename//가맹점 이름
    const _storephone = req.body.input_storephone
    const pay_amount = await req.body._gamepayment//가맹점 결제 금액 입력
    const numeric6 = await req.body._numeric6.trim()//결제비밀번호입력
    state = 1

    if(pay_amount<=0||numeric6 ==""){//결제금액이나 결제 비밀번호 입력이 안 되었으면
        //const pay_amount=0
        console.log("gamepay_amount가 입력되지 않았어요")
        res.render("gamepay",{
            amount:result8[0].charge_amount,
            phonenum : result8[0].phone,
            username :result8[0].username,
            storename: _storename,
            storephone: _storephone,
            state:false
        })
    }else{//결제금액 입력이 되었으면
        console.log("gamepay_amount =", pay_amount  )

        //비밀번호 맞는지 확인
        const sql8 = `
            select 
            *
            from 
            log_info
            where 
            phone = ?                        
                `
        const values8 = [_phone ]
        connection.query(
        sql8, 
        values8, 
        function(err, result8){
            if(err){
                console.log(err)
            }else{
                            
                //잔액이 부족하지 않으면 시간체크
                const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')
                const _phone =  req.session.logined.phone
                const _username = req.session.logined.username
                const _charge =req.session.logined.charge_amount
                console.log("_phone",_phone)
                
                //기존 나의 잔액확인
                const _charge_amount = result8[0].charge_amount
                
                //charge 잔액이 가맹점결제금액보다 작은지 확인
                if(_charge_amount<pay_amount){

                    //결제금액 미만이면 충전하러 가기
                    res.render("charge",{
                        st:0,
                        username:req.session.logined.username,
                        amount:_charge_amount,
                        phone:req.session.logined.phone
                    })
                }else{
                    //비밀번호 오류여부 : 틀리면 다시결제화면으로
                    if( numeric6 != result8[0].numeric6){
                        console.log("비밀번호 오류")
                        let da = 0
                        res.render("gamepay",{
                            amount:result8[0].charge_amount,
                            phonenum : result8[0].phone,
                            username :result8[0].username,
                            storename: _storename,
                            storephone: _storephone,
                            state : 0
                        })
                    }else{//비밀번호 일치하면 
                        da = 1 
                        console.log("비밀번호 일치하여 거래진행")
                        
                        
                        //1. 가맹점거래리스트에 거래내역 추가 : store_pay(나 기준 거래 내역)
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
                                
                            //가맹점의 폰번호
                            const store_phone = result[0].phone

                            //2.가맹점 추가 금액 계산 수정 : store (kpoint추가)
                            const _store_amount = parseInt(result[0].store_amount) + parseInt(pay_amount)
                            kpoint.storeamount_update( _storename, _store_amount  )
                                
                            //4. KP_list에 추가 + 가맹점 금액추가
                            const sql2 = 
                            `
                                select 
                                *
                                from 
                                log_info
                                where 
                                phone = ?                        
                            `
                            const values2 = [ store_phone ]
                            connection.query(
                            sql2, 
                            values2, 
                            function(err, result2){
                                if(err){
                                    console.log(err)
                                }else{ 
                                     

                                    //나의 거래
                                    const trans_tp = _storename.toString()
                                    kpoint.kpoint_list_insert_m(_phone, trans_tp, _input_dt, pay_amount )
                                    
                                    //가맹점의 거래
                                    const trans_tp1 =  _username
                                    const new_dt = moment(_input_dt).add(2, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
                                    kpoint.kpoint_list_insert_g(store_phone, new_dt, trans_tp1,  pay_amount)

                                     //5. 가맹점에 입금된 금액 추가 계산 : log_info
                                    kpoint.log_info_amount_update2(store_phone ,pay_amount ) //원본디비수정(가맹점) 증액
                                    kpoint.log_info_amount_update1(_phone, pay_amount   ) //원본디비수정(나)    차감 


                                    //가맹점에 안내 메세지
                                    const gphone = "+82"+  store_phone
                                    console.log("가맹점 폰 =",gphone)
                                    
                                    twilioClient.messages.create({
                                        body: '케이그라운드 가맹점 결제 완료[' + trans_tp +']  :  '+  pay_amount ,
                                        from: process.env.kphonenumber,
                                        to: gphone
                                        })
                                        .then(message => console.log("가맹점결제(kground)----", gphone,trans_tp,message.sid))
                                    
                                        res.redirect("gamepay_list")
                                    }})
                        }})
                                }  }}})}}})
                

                                

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


    router.get('/kp_trans_gloves', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{

        const kpoint = req.query.kpoint
        const filename = req.query.name
        data=1
        const _phone= req.session.logined.phone
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

                    // const wallet = req.session.logined.wallet
                    req.session.logined=result2[0]
                    const balance =result2[0].charge_amount
                    const username= req.session.logined.username
                    const s = req.body.state
                    const sql6 =
                        `
                        select 
                        *
                        from 
                        gloves
                        where 
                        filename = ?
                        
                            `
                    const values6 = [filename]
                    connection.query(
                    sql6, 
                    values6, 
                    function(err, result6){
                        if(err){
                            console.log(err)
                        }else{
                            const price=result6[0].pay
                            const card = result6[0].card
                            const filename= result6[0].filename
                            const paymethod= result6[0].paymethod
                            const juso=req.body.input_post
                        res.render('kp_trans_gloves', {
                            name:result6[0].name,
                            kpoint:kpoint,
                            filename:filename,
                            amount : balance,
                            phonenum : result2[0].phone,
                            username : username,
                            state : 0,
                            phone : result2[0].phone,
                            card : card,
                            paymethod:paymethod,
                            price:price,
                            post:juso,
                            quantity:req.body.input_quantity,
                            st:1
                        })
    }})}}) }})
        
        
    router.post('/kp_trans_gloves', async (req, res)=>{
    if(!req.session.logined){
    let data=0
    res.render('login', {
        'state' : data
        })
    }else{
        data=1
        const name= req.body.name
        console.log("name =",name)
        const card=req.body.card
        const kpoint=req.body.kpoint
        const receiptphone =await req.body._reciept//수신자폰
        //onst pay_card = await req.body.card
        const pay_amount = await req.body._sendpay//보낼금액
        const numeric6 = await req.body._numeric6.trim()
        console.log("쇼핑몰 거래 amount =",pay_amount)
        
        
        const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')//거래시간
        console.log("_input_dt =",_input_dt)

        //보내는 사람의  정보
        const _phone =  req.session.logined.phone  
        const _username = req.session.logined.username
        
        //내가 나에게 보내는가?
        if(receiptphone==_phone){
      
            console.log("내가 나에게 보낼 수 없다") 
            res.render('kp_trans_gloves', {
                amount :  charge_amount,
                phonenum : _phone,
                username :  _username,
                state : 1
                    
            })
        }else{
            console.log("receiptphone =",receiptphone)
            
            var charge_amount= 0
        
            //송신자의 금액정정
            const sql2 = 
                `
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

                    //1. 송신자 금액정정
                    const _charge_amount = result2[0].charge_amount//나의 원장 충전금액
                    console.log( "_charge_amount =",result2[0].charge_amount)
                    
                    //조건 1. 충전금액이 지불항 금액보다 작으면 다시 충전하러
                    if(_charge_amount<pay_amount){

                        //거래금액 미만이면 충전하러 갈것
                        res.render("charge",{
                            st:0,
                            username:req.session.logined.username,
                            amount:_charge_amount,
                            phone:req.session.logined.phone
                        })
        
                    }else{
                        //조건2. 비밀번호 설정이 안되어 있으면 다시 설정하러
                        if(result2[0].numeric6==""){
                            red.render("auth6",{
                                username:req.session.logined.username,
                                amount:_charge_amount,
                                phone:req.session.logined.phone

                            })
                        }else{
                        
                            //조건3.비밀번호가 틀리면 안내 후 다시 시작
                            if( numeric6 != result2[0].numeric6){
                                let da = 0
                                res.render("kp_trans_gloves",{
                                    username :_username,
                                    amount:_charge_amount,
                                    state : da
                                })
                            }else{
                                
                                //비밀번호 맞다면 거래
                                da = 1 

                               
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

                                    //2. 수신자(친구) 금액 추가 정정 
                                    console.log("//수신자의 전번", receiptphone)
                                    
                                    const reciept_amount = result6[0].charge_amount//수신자의 원장 충전금액
                                    
                                    //3. 친구끼리 거래하기거래리스트에 거래내역 추가 
                                    const rec_username= result6[0].username.toString()
                                
                                    console.log("친구끼리의 거래정보 리스트에 추가",_input_dt, _phone, rec_username, receiptphone, pay_amount )
                                    kpoint.trans_list_insert(_input_dt, _phone, rec_username, receiptphone, pay_amount )

                                    //친구에게 보내기 내역 기록
                                    //4. KP_list에 추가  //보내는 사람=나
                                    const trans_tp = _username//보내는 사람
                                    const trans_tp1=rec_username//받는사람

                                    const new_dt1 = moment(_input_dt).add(2, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
                                    kpoint.kpoint_list_insert_m(_phone, trans_tp1,  new_dt1, pay_amount)

                                    // //5. KP_list에 추가 //수신자
                                    const new_dt = moment(_input_dt).add(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
                                    kpoint.kpoint_list_insert(receiptphone, trans_tp,  new_dt, pay_amount)

                                            //1. log_info 정보 감액수정(보내는 사람 즉 나)
                                    console.log("log_info_amount_update1", _phone, pay_amount )
                                    kpoint.log_info_amount_update1(_phone,pay_amount )

                                    // 1. 수신자 log_info 수정
                                    console.log("log_info_amount_update2", receiptphone, pay_amount )
                                    kpoint.log_info_amount_update2( receiptphone, pay_amount)


                                        //보낸사람에 안내 메세지
                                        const gphone = "+82"+  _phone        
                                        const ggphone = "+82"+  "01025961010"
                                    
                                            console.log("보낸사람의  폰 =",gphone)

                                        twilioClient.messages.create({
                                            body:  '[' + trans_tp +']님께서 [' + trans_tp1 +']에게 쇼핑몰 KPoint 결제 완료  :  '+  pay_amount ,
                                            from: process.env.kphonenumber,
                                            to: gphone
                                            })
                                            .then(message => console.log("쇼핑몰 결제(kground)----", gphone,trans_tp1,message.sid))
                                    
                                        twilioClient.messages.create({
                                            body:trans_tp +'님께서 케이그라운드 쇼핑몰 Kpoint 결제 완료):   ' +   pay_amount ,
                                            from: process.env.kphonenumber,
                                            to:  ggphone
                                            })
                                            .then(message => console.log("쇼핑몰 결제(kground)---- ok(----", ggphone, message.sid))


                                        //6.transpay_list준비 
                                        const phone = req.session.logined.phone 
                                        const user = req.session.logined.username         
                                        const tokenamount = req.session.logined.charge_amount
                                        console.log("tokenamount =",tokenamount )
                                        const sql6 =
                                            `
                                            select 
                                            *
                                            from 
                                            gloves
                                            where 
                                            filename = ?
                                            
                                                `
                                        const values6 = [name]
                                        connection.query(
                                        sql6, 
                                        values6, 
                                        function(err, result6){
                                            if(err){
                                                console.log(err)
                                            }else{
                                                const price=result6[0].hap
                                                const kpoint =result6[0].kpoint
                                                const card = result6[0].card
                                                const _product_name =name
                                                const filename= result6[0].filename
                                                const paymethod= result6[0].paymethod
                                                console.log("paymethod= ",paymethod )
                                                const juso=req.body.input_post//주문한 사람의 주소

                                                if(paymethod=="KPoint포함(신용간단결제)"){
                                                    res.render('card_pay', {

                                                        name:name,
                                                        amount : tokenamount ,
                                                        phone : phone,
                                                        card : card,
                                                        filename:filename,
                                                        paymethod:paymethod,
                                                        username :user,
                                                        productname: _product_name,
                                                        price:price,
                                                        kpoint:kpoint,
                                                        post:juso,
                                                        st:1
                                                })
                                                }else{
                                                    res.render('index',{
                                                        login_data:req.session.logined,
                                                        amount:tokenamount                                                     })     
                                                }
                                                
                            
    }})
         }}})                    
         }}}}}})
                }
    }})
        


    router.get('/gigadetail', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{
            //원장읽어오기
            const phone = req.session.logined.phone 
            const sql7 =
                `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                    `
            const values7 = [phone]
            connection.query(
            sql7, 
            values7, 
            function(err, result7){
                if(err){
                    console.log(err)
                }else{
                    const balance = result7[0].charge_amount    


                    const product_name  = req.query.name
                    console.log("product_name  =", product_name   )

                    const sql6 =
                        `
                        select 
                        *
                        from 
                        giga
                        where 
                        name = ?
                        
                            `
                    const values6 = [product_name]
                    connection.query(
                    sql6, 
                    values6, 
                    function(err, result6){
                        if(err){
                            console.log(err)
                        }else{
                            const price=result6[0].hap
                            const kpoint =result6[0].kpoint
                            const card = result6[0].card
                            const filename=result6[0].filename
                            const filename_detail=result6[0].filename_detail
                            
                            const juso=req.body.input_post//주문한 사람의 주소
                            const option1 =result6[0].option1
                            const option2 =result6[0].option2
                            const option3 =result6[0].option3
                            const option4 =result6[0].option4
                            const option5 =result6[0].option5
                            const option6 =result6[0].option6
                            const etcoption =result6[0].etcoption
                            //주문시간
                            //주문한사람정보
                            res.render('glovesdetail', {
                                amount : balance ,
                                phone : phone,
                                card:card,
                                filename:filename,
                                filename_detail:filename_detail,
                                username :result7[0].username,
                                productname: product_name,
                                price:price,
                                kpoint:kpoint,
                                option1:option1,
                                option2:option2,
                                option3:option3,
                                option4:option4,
                                option5:option5,
                                option6:option6,
                                etcoption:etcoption,
                                juso:juso
                                
                    })}})
    }})}})









    //========================================================
    //쇼핑몰 거래
    router.get('/kp_trans_kpoint', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{

        const kpoint = req.query.kpoint
        const filename = req.query.name
        const card=req.query.card
        data=1
        const _phone= req.session.logined.phone
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

                        // const wallet = req.session.logined.wallet
                        req.session.logined=result2[0]
                        const balance =result2[0].charge_amount
                        const username= req.session.logined.username
                        const s = req.body.state
                        const sql6 =
                            `
                            select 
                            *
                            from 
                            giga
                            where 
                            filename = ?
                            
                                `
                        const values6 = [filename]
                        connection.query(
                        sql6, 
                        values6, 
                        function(err, result6){
                            if(err){
                                console.log(err)
                            }else{
                                const price=result6[0].pay
                                
                                const filename= result6[0].filename
                                const paymethod= result6[0].paymethod
                                const juso=req.body.input_post
                            res.render('kp_trans_kpoint', {
                                name:result6[0].name,
                                kpoint:kpoint,
                                filename:filename,
                                amount : balance,
                                phonenum : result2[0].phone,
                                username : username,
                                state : 0,
                                phone : result2[0].phone,
                                card : card,
                                paymethod:paymethod,
                                price:price,
                                post:juso,
                                quantity:req.body.input_quantity,
                                st:1
                            })
        }})}}) }})
                    
        
        
 router.post('/kp_trans_kpoint', async (req, res)=>{
    if(!req.session.logined){
    let data=0
    res.render('login', {
        'state' : data
        })
    }else{
        data=1
        const name= req.body.name
        const receiptphone =await req.body._reciept//수신자폰
        const pay_amount = await req.body._sendpay//보낼금액
        const numeric6 = await req.body._numeric6.trim()
        console.log("쇼핑몰 거래 amount =",pay_amount)
        const card=req.body.card
        
        
        const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')//거래시간
        console.log("_input_dt =",_input_dt)

        //보내는 사람의  정보
        const _phone =  req.session.logined.phone  
        const _username = req.session.logined.username
        
        //내가 나에게 보내는가?
        if(receiptphone!=_phone){
            console.log("receiptphone =",receiptphone)
            
            var charge_amount= 0
        
            //송신자의 금액정정
            const sql2 = 
                `
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

                    //1. 송신자 금액정정
                    const _charge_amount = result2[0].charge_amount//나의 원장 충전금액
                    console.log( "_charge_amount =",result2[0].charge_amount)
                    
                    //조건 1. 충전금액이 지불항 금액보다 작으면 다시 충전하러
                    if(_charge_amount<pay_amount){

                        //거래금액 미만이면 충전하러 갈것
                        res.render("charge",{
                            st:0,
                            username:req.session.logined.username,
                            amount:_charge_amount,
                            phone:req.session.logined.phone
                        })
        
                    }else{
                        //조건2. 비밀번호 설정이 안되어 있으면 다시 설정하러
                        if(result2[0].numeric6==""){
                            red.render("auth6",{
                                username:req.session.logined.username,
                                amount:_charge_amount,
                                phone:req.session.logined.phone

                            })
                        }else{
                        
                            //조건3.비밀번호가 틀리면 안내 후 다시 시작
                            if( numeric6 != result2[0].numeric6){
                                let da = 0
                                res.render("kp_trans_kpoint",{
                                    username :_username,
                                    amount:_charge_amount,
                                    state : da
                                })
                            }else{
                                
                                //비밀번호 맞다면 거래
                                da = 1 
    
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

                                    //2. 수신자(친구) 금액 추가 정정 
                                    console.log("//수신자의 전번", receiptphone)
                                    
                                    const reciept_amount = result6[0].charge_amount//수신자의 원장 충전금액
                        
                                    //3. 친구끼리 거래하기거래리스트에 거래내역 추가 
                                    const rec_username= result6[0].username.toString()
                                
                                    console.log("친구끼리의 거래정보 리스트에 추가",_input_dt, _phone, rec_username, receiptphone, pay_amount )
                                    kpoint.trans_list_insert(_input_dt, _phone, rec_username, receiptphone, pay_amount )

                                    //친구에게 보내기 내역 기록
                                    //4. KP_list에 추가  //보내는 사람=나
                                    const trans_tp = _username//보내는 사람
                                    const trans_tp1=rec_username//받는사람
                                    
                                    const new_dt1 = moment(_input_dt).add(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
                                    kpoint.kpoint_list_insert_m(_phone, trans_tp1,  new_dt1, pay_amount)

                                    const new_dt = moment(_input_dt).add(2, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
                                    kpoint.kpoint_list_insert(receiptphone, trans_tp,  new_dt, pay_amount)

                                                                        //1. log_info 정보 감액수정(보내는 사람 즉 나)
                                    console.log("log_info_amount_update1", _phone, pay_amount )
                                    kpoint.log_info_amount_update1(_phone,pay_amount )

                                    // 1. 수신자 log_info 수정
                                    console.log("log_info_amount_update2", receiptphone, pay_amount )
                                    kpoint.log_info_amount_update2( receiptphone, pay_amount)

                                    //보낸사람에 안내 메세지
                                    const gphone = "+82"+  _phone        
                                    const ggphone = "+82"+  "01025961010"
                                
                                        console.log("보낸사람의  폰 =",gphone)

                                    twilioClient.messages.create({
                                        body:  '[' + trans_tp +']님께서 [' + trans_tp1 +']에게 쇼핑몰 KPoint 결제 완료  :  '+  pay_amount ,
                                        from: process.env.kphonenumber,
                                        to: gphone
                                        })
                                        .then(message => console.log("쇼핑몰 결제(kground)----", gphone,trans_tp1,message.sid))
                                
                                    twilioClient.messages.create({
                                        body:trans_tp +'님께서 케이그라운드 쇼핑몰 Kpoint 결제 완료):   ' +   pay_amount ,
                                        from: process.env.kphonenumber,
                                        to:  ggphone
                                        })
                                        .then(message => console.log("쇼핑몰 결제(kground)---- ok(----", ggphone, message.sid))


                                    //6.transpay_list준비 
                                    const phone = req.session.logined.phone 
                                    const user = req.session.logined.username         
                                    const tokenamount = req.session.logined.charge_amount

                                    console.log(" tokenamount =  ", tokenamount )
                                    
                                    const sql6 =
                                        `
                                        select 
                                        *
                                        from 
                                        giga_pay
                                        where 
                                        filename = ?
                                        
                                            `
                                    const values6 = [name]
                                    connection.query(
                                    sql6, 
                                    values6, 
                                    function(err, result6){
                                        if(err){
                                            console.log(err)
                                        }else{
                                            const price=result6[0].pay
                                            const kpoint =result6[0].kpoint
                                            // const card = result6[0].card
                                            const _product_name =name
                                            const filename= result6[0].filename
                                            const paymethod= result6[0].paymethod
                                            const juso=req.body.input_post 
                                            console.log(" paymethod= ",paymethod)
                                            
                                            if(paymethod=="KPoint포함(신용간단결제)"){
                                                res.render('card_pay', {

                                                    name:name,
                                                    amount : tokenamount ,
                                                    phone : phone,
                                                    card : card,
                                                    filename:filename,
                                                    paymethod:paymethod,
                                                    username :user,
                                                    productname: _product_name,
                                                    price:price,
                                                    kpoint:kpoint,
                                                    post:juso,
                                                    st:1
                                            })
                                            }else{
                                                res.render('index',{
                                                    login_data:req.session.logined,
                                                    amount:tokenamount                                                     })     
                                            }
                                                
                            
                                            }})
                                            }}})                    
                    }}}}}})
        
                }else{
                console.log("내가 나에게 보낼 수 없다") 
                res.render('kp_trans_kpoint', {
                    amount :  _charge_amount,
                    phonenum : _phone,
                    username :  _username,
                    state : 1
                        
                })
                }
}})



router.get('/kp_trans', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{

        
        data=1
        const _phone= req.session.logined.phone
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

                    // const wallet = req.session.logined.wallet
                    req.session.logined=result2[0]
                    const balance =result2[0].charge_amount
                    const _user= req.session.logined.username
                    const s = req.body.state
                    
                    res.render('kp_trans', {
                        amount : balance,
                        phonenum : _phone,
                        username : _user,
                        state : 0
                    })
                }})}}) 

//친구끼리 kpoint보내기
router.post('/kp_trans', async (req, res)=>{
    if(!req.session.logined){
    let data=0
    res.render('login', {
        'state' : data
        })
    }else{
        //친구에게 보낼 금액과 전번 비번입력받음
        data=1
        const receiptphone =await req.body._reciept.trim()//수신자폰
        const pay_amount = await req.body._sendpay.trim()//보낼금액
        const numeric6 = await req.body._numeric6.trim()
        console.log("친구끼리 거래할 pay_amount =",pay_amount)

        if (pay_amount<=0||numeric6 ==""){//결제금액이나 결제 비밀번호 입력이 안 되었으면
            console.log("pay_amount나 결제비밀번호 오류")
            res.render("kp_trans",{
                amount:req.session.logined.charge_amount,
                phonenum : req.session.logined.phone,
                username :req.session.logined.username,
                state:false
            })
        }else{//결제금액이나 결제 비밀번호 입력이 되었으면

            //보내는 사람의  정보
            const _phone =  req.session.logined.phone  
            const _username = req.session.logined.username
            const _charge_amount=req.session.logined.charge_amount
            //내가 나에게 보내는가?
            if(receiptphone==_phone){
                console.log("receiptphone =",receiptphone)
                console.log("내가 나에게 보낼 수 없다") 
                    res.render('kp_trans', {
                        amount :  _charge_amount,
                        phonenum : _phone,
                        username :  _username,
                        state : 1
                            
                    })
                }else{
                   
                    var charge_amount= 0
                
                    //나의 원본자료 추출
                    const sql2 = 
                        `
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
                        const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')//거래시간
                        console.log("_input_dt =",_input_dt)

                        if(result2.length!=0){
                           
                            //1. 송신자 금액모지란지 확인
                            const _charge_amount = result2[0].charge_amount//나의 원장 충전금액
                             
                                
                            //조건 1. 충전금액이 지불항 금액보다 작으면 다시 충전하러
                            if(_charge_amount<pay_amount){

                                //거래금액 미만이면 충전하러 갈것
                                res.render("charge",{
                                    st:0,
                                    username:req.session.logined.username,
                                    amount:_charge_amount,
                                    phone:req.session.logined.phone
                                })
            
                            }else{
                                //조건3.비밀번호가 틀리면 안내 후 다시 시작
                                if( numeric6 != result2[0].numeric6){
                                    let da = 0
                                    res.render("kp_trans",{
                                        username :_username,
                                        amount:_charge_amount,
                                        state : da
                                    })
                                }else{
                                    
                                    //비밀번호 맞다면 거래
                                    da = 1 

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

                                        //2. 수신자(친구) 금액 추가 정정 
                                        console.log("//수신자의 전번", receiptphone)
                                        
                                        const reciept_amount = result6[0].charge_amount//수신자의 원장 충전금액
                            
                                        
                                        
                                            //3. 친구끼리 거래하기거래리스트에 거래내역 추가 
                                            const rec_username= result6[0].username.toString()
                                        
                                            console.log("친구끼리의 거래정보 리스트에 추가",_input_dt, _phone, rec_username, receiptphone, pay_amount )
                                            kpoint.trans_list_insert(_input_dt, _phone, rec_username, receiptphone, pay_amount )

                                            //친구에게 보내기 내역 기록
                                            //4. KP_list에 추가  //보내는 사람=나
                                            const trans_tp = _username//보내는 사람
                                            const trans_tp1=rec_username//받는사람

                                            const _pay_amount= parseInt(pay_amount)
                                            const new_dt1 = moment(_input_dt).add(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
                                            kpoint.kpoint_list_insert_m(_phone, trans_tp1,  new_dt1, pay_amount)

                                            
                                            // //5. KP_list에 추가 //수신자
                                            
                                            const new_dt = moment(_input_dt).add(2, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
                                            console.log("0.01초 더한시간",new_dt) 
                                             
                                            kpoint.kpoint_list_insert(receiptphone, trans_tp,  new_dt, pay_amount)

                                             //1. log_info 정보 감액수정(보내는 사람 즉 나)
                                            kpoint.log_info_amount_update1(_phone,pay_amount )
                                            kpoint.log_info_amount_update2( receiptphone, pay_amount)

                                            //보낸사람에 안내 메세지
                                            const gphone = "+82"+  _phone
                                            console.log("보낸사람의  폰 =",gphone)
                                            twilioClient.messages.create({
                                                body:  '[' + trans_tp +']님께서 [' + trans_tp1 +']에게 KPoint 보내기 완료  :  '+  pay_amount ,
                                                from: process.env.kphonenumber,
                                                to: gphone
                                                })
                                                .then(message => console.log("친구에게 보내기(kground)----", gphone,trans_tp1,message.sid))
                                        

                                            //6.transpay_list준비 
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
                                            }}})                    
                        }}}}}) }
}}})



//kpoint trans list 
router.get('/transpay_list', async (req, res)=>{
if(!req.session.logined){
    res.redirect("/")
    }else{  
        console.log("회원끼리 거래내역보기")  
        
        //원장읽어오기
        const phone = req.session.logined.phone 
        const sql7 =
            `
            select 
            *
            from 
            log_info
            where 
            phone = ?
            
                `
        const values7 = [phone]
        connection.query(
        sql7, 
        values7, 
        function(err, result7){
            if(err){
                console.log(err)
            }else{
                req.session.logined=result7[0]
                

                const user = result7[0].username         
                const tokenamount =result7[0].charge_amount

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
                                'phone': result7[0].phone
                            })}
                        })
                }})}})




return router
}
