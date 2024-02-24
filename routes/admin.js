const session = require('express-session')
const express = require('express')
//현재의 시간을 알려주는 모듈모드
const moment = require('moment')
const router = express.Router()

const fs = require('fs')
const path = require('path')

// 파일 업로드를 사용하기위한 모듈
const multer = require('multer')
const storage = multer.diskStorage(
    {
        destination : function(req, file, cb){
            cb(null, 'public/uploads/')
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

//js 파일 로드 
const kpoint = require("../token/kpoint")
const error = require("../token/error")

module.exports = ()=>{


    router.get("/", async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
        }else{
            res.render('admin_index', {
                login_data : req.session.logined, 
                 
            })
        }
    })


    router.get('/admin_index', function(req, res){
        if(!req.session.logined){
            console.log('로그인정보가 없음')
            res.redirect("/")
        }else{
            console.log('관리자 모드 로그인 되었어요')

            //log_info의 통계
            const sql2 = `
                select 
                * 
                from 
                log_info 
                `
            connection.query(
                sql2, 
            function(err, result2){
                if(err){
                    console.log(err)
                    res.send(err)
                }else{
                    const tot_count = result2.length
                    // const tot_charge=''
                    let tot_char = 0
                    for(var i=0;i<tot_count; ++i){
                        tot_char = tot_char+result2[i].charge_amount
                    }
                    const tot_charge = tot_char.toString()

                    //KPoint 의 입금 통계
                    const transtype="charge"
                    const sql3 = `
                        select 
                        * 
                        from 
                        kp_list
                        where
                        transtype=?
                        `
                    const values3=[transtype]
                    connection.query(
                        sql3, 
                        values3,
                    function(err, result3){
                        if(err){
                            console.log(err)
                            res.send(err)
                        }else{
                            const tot_charge_count = result3.length
                            // const tot_charge_charge=''
                            let tot_char = 0
                            for(var i=0;i<tot_charge_count; ++i){
                                tot_char = tot_char+parseInt(result3[i].transamount)
                            }
                            const tot_charge_charge = tot_char.toString()

                            const transtype="festival"
                            const sql5 = `
                                select 
                                * 
                                from 
                                kp_list6
                                where
                                transtype = ? and  month(transtime) = 10
                               
                                `
                            const values5=[transtype]
                            connection.query(
                                sql5, 
                                values5,
                            function(err, result5){
                                if(err){
                                    console.log(err)
                                    res.send(err)
                                }else{
                                    const count = result5.length
                                    
                                    const tot_10_count =count

                                    const sql6 = `
                                    select 
                                    * 
                                    from 
                                    kp_list6
                                    where
                                    transtype = ? and  month(transtime) = 11
                                   
                                    `
                                const values6=[transtype]
                                connection.query(
                                    sql6, 
                                    values6,
                                function(err, result6){
                                    if(err){
                                        console.log(err)
                                        res.send(err)
                                    }else{
                                        const count = result6.length
                                        
                                        const tot_11_count =count   
                                        
                                        const sql7 = `
                                        select 
                                        * 
                                        from 
                                        kp_list6
                                        where
                                        transtype = ? and  month(transtime) = 12
                                       
                                        `
                                    const values7=[transtype]
                                    connection.query(
                                        sql7, 
                                        values7,
                                    function(err, result7){
                                        if(err){
                                            console.log(err)
                                            res.send(err)
                                        }else{
                                            const count = result7.length
                                            
                                            const tot_12_count =count

                                            const sql8 = `
                                                select 
                                                * 
                                                from 
                                                kp_list
                                                where
                                                transtype = ? and  month(transtime) = 1
                                            
                                                `
                                        const values8=[transtype]
                                        connection.query(
                                            sql8, 
                                            values8,
                                        function(err, result8){
                                            if(err){
                                                console.log(err)
                                                res.send(err)
                                            }else{
                                                const count = result8.length
                                                
                                                const tot_24_1_count =count
                                                const sql9 = `
                                                select 
                                                * 
                                                from 
                                                kp_list
                                                where
                                                transtype = ? and  month(transtime) = 2
                                            
                                                `
                                        const values9=[transtype]
                                        connection.query(
                                            sql9, 
                                            values9,
                                        function(err, result9){
                                            if(err){
                                                console.log(err)
                                                res.send(err)
                                            }else{
                                                const count = result9.length
                                                
                                                const tot_24_2_count =count


                                    //KPoint 의 출금 통계
                                    const transtype1="festival"
                                    const transtype2="store"
                                    const sql4 = `
                                        select 
                                        *
                                        from 
                                        kp_list
                                        where
                                        transtype=? || transtype = ?
                                        `
                                        const values4=[transtype1,transtype2]
                                        connection.query(
                                            sql4, 
                                            values4,
                                        function(err, result4){
                                            if(err){
                                                console.log(err)
                                                res.send(err)
                                            }else{
                                                const tot_deposit_count = result4.length
                                                // const tot_deposit=''
                                                let tot_char = 0
                                                for(var i=0;i<tot_deposit_count; ++i){
                                                    tot_char = tot_char + result4[i].kp_amount
                                                }
                                                const tot_deposit = tot_char.toString()

                                                res.render('admin_index.ejs', {
                                                    'login_data': req.session.logined ,
                                                    total_count:tot_count,
                                                    tot_c:count,
                                                    tot_10_count:tot_10_count,
                                                    tot_11_count:tot_11_count,
                                                    tot_12_count:tot_12_count,
                                                    tot_24_1_count:tot_24_1_count,
                                                    tot_24_2_count:tot_24_2_count,
                                                    total_charge:tot_charge,
                                                    total_charge_count:tot_charge_count,
                                                    total_charge_charge:tot_charge_charge,
                                                    tot_deposit_count:tot_deposit_count,
                                                    total_deposit:tot_deposit
                                            })
                                }})}})}})}})}})}})}})}
                            })}
                    })            




//회원목록출력 출력
router.get('/admin_custom', async (req, res)=>{
    
    if(!req.session.logined){
        res.redirect("/")
    }else{    
        const user = req.session.logined.username
        const kp_amount = req.session.logined.charge_amount   
        const phone = req.session.logined.phone 

        //kpoint 최신자료 순 정렬
        console.log("admin 최신자료 순 정렬 (kp_list) ")
        const sql =
            `
            select 
            *
            from 
            log_info
            
            order by logdate DESC
                `
         
        connection.query(
            sql, 
             
            function(err, result){
                if(err){
                    console.log(err)
                }
                console.log("sort 결과 출력가능 ")
                console.log("result=", result.length) 
                console.log("kp_amount =", kp_amount)  
                res.render('admin_custom', {
                    'resultt': result,
                    username:user
                    
                    })
        })
    }})
    
    
    //admin_chargelist
    router.get('/admin_chargelist', async (req, res)=>{
    
        if(!req.session.logined){
            res.redirect("/")
        }else{    
            const user = req.session.logined.username
            const kp_amount = req.session.logined.charge_amount   
            const phone = req.session.logined.phone 
    
            //kpoint 최신자료 순 정렬
            console.log("admin 최신자료 순 정렬 (kp_list) ")
            const sql =
                `
                select 
                *
                from 
                charge_list
                
                order by chargedate DESC
                    `
             
            connection.query(
                sql, 
                 
                function(err, result){
                    if(err){
                        console.log(err)
                    }
                    console.log("sort 결과 출력가능 ")
                    console.log("result=", result.length) 
                    console.log("kp_amount =", kp_amount)  
                    res.render('admin_chargelist', {
                        'resultt': result,
                        username:user
                        
                        })
            })
        }})


    //admin_kplist
    router.get('/admin_kplist', async (req, res)=>{
    
        if(!req.session.logined){
            res.redirect("/")
        }else{    
            const user = req.session.logined.username
            const kp_amount = req.session.logined.charge_amount   
            const phone = req.session.logined.phone 
    
            //kpoint 최신자료 순 정렬
            console.log("admin 최신자료 순 정렬 (kp_list) ")
            const sql =
                `
                select 
                *
                from 
                kp_list
                
                order by transtime DESC
                    `
             
            connection.query(
                sql, 
                 
                function(err, result){
                    if(err){
                        console.log(err)
                    }
                    console.log("sort 결과 출력가능 ")
                    console.log("result=", result.length) 
                    console.log("kp_amount =", kp_amount)  
                    res.render('admin_kplist', {
                        'resultt': result,
                        username:user
                        
                        })
            })
        }})



    //admin_gameanglist
    router.get('/admin_gameanglist', async (req, res)=>{
    
        if(!req.session.logined){
            res.redirect("/")
        }else{    
            const user = req.session.logined.username
            const kp_amount = req.session.logined.charge_amount   
            const phone = req.session.logined.phone 
    
            //kpoint 최신자료 순 정렬
            console.log("admin 최신자료 순 정렬 (kp_list) ")
            const sql =
                `
                select 
                *
                from 
                store_pay
                
                order by store ASC, transdate  DESC
                    `
             
            connection.query(
                sql, 
                 
                function(err, result){
                    if(err){
                        console.log(err)
                    }
                    console.log("sort 결과 출력가능 ")
                    console.log("result=", result) 
                    console.log("kp_amount =", kp_amount)  
                    res.render('admin_gameanglist', {
                        'resultt': result,
                        username:user
                        
                        })
            })
        }})
        

////////////관리자 차감===========================================================
router.get('/admin_chagamok', function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
       
                res.render("admin_chagamok",{
                    'login_data': req.session.logined ,
                    // resultt:result2
                } )
            }
})


router.post('/admin_chagamok', async function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
        
        //입력 받기(전번 or 성명)
        const user_phone = await req.body.input_phone
        const user_name = await req.body.input_username
        console.log("admin ", user_phone,user_name)
        //log_info의 통계
        const sql2 = `
            select 
            * 
            from 
            log_info 
            where
            username=? || phone=?
            `
        const values2 =[user_name, user_phone ]   

        connection.query(
            sql2, 
            values2,
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                console.log("admin_'s 렌더링해주는 result2=", result2)
                res.render("admin_chagam",{
                    'login_data': req.session.logined ,
                    resultt:result2,
                    username:result2[0].username, 
                    recieptphone:result2[0].phone,
                    amount:result2[0].charge_amount,
                    state:0
                } )
            }
        })
    }})            
        
router.get('/admin_chagam', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{

        
        data=1
        //회사원장 불러오기
        const _phone= "01080818962"
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
                    // req.session.logined=result2[0]
                    const balance =result2[0].charge_amount//회사 잔고
                    const _user= result2[0].username//회사명
                    
                    res.render('admin_chagam', {
                        amount : balance,
                        phonenum : _phone,
                        username : _user,
                        state : 0
                    })
}})}}) 


router.post('/admin_chagam', async (req, res)=>{
    if(!req.session.logined){
    let data=0
    res.render('login', {
        'state' : data
        })
    }else{
        data=1
        const adminphone = req.body._admin//관리자대표폰
        const chagamphone = req.body._reciept//차감될 휴대폰receiptphone
        const pay_amount = await req.body._sendpay.trim()//차감금액

        const sql6 = `
            select 
            *
            from 
            log_info
            where 
            phone = ?
            `
        const values6 = [ adminphone]
        connection.query(
        sql6, 
        values6, 
        function(err, result2){//관리자 원본정보--------- 2
            if(err){
                console.log(err)
            }else{ 

                console.log("trans_amount =", adminphone,chagamphone, pay_amount)
                const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')//거래시간
                
                //보내는 관리자의  정보
                const _phone =  req.session.logined.phone  //보내는 관리자의 폰번호
                const _username = req.session.logined.username
                
                ///2. 차감대상자 금액 추가 정정
                const sql6 = `
                    select 
                    *
                    from 
                    log_info
                    where 
                    phone = ?
                    `
                const values6 = [ chagamphone]
                connection.query(
                sql6, 
                values6, 
                function(err, result6){//차감대상자----------- 6
                    if(err){
                        console.log(err)
                    }else{ 
                            
                            //3. admin 거래내역 추가 
                            const chagam_amount = result6[0].charge_amount//차감 대상자의 원장 충전금액
                            const chagam_username= result6[0].username.toString()

                            const chagam_amount1=parseInt(chagam_amount)-parseInt(pay_amount)//차감대상자 차감게산
                            const admin_amount= parseInt(result2[0].charge_amount)+parseInt(pay_amount)//관리자 덧셈 계산
                            const pay_amount2 =parseInt(pay_amount)*-1//차감표시

                            console.log("admin 거래정보 리스트에 추가",_input_dt,_username,chagam_username, pay_amount2 , chagam_amount1, admin_amount)
                            kpoint.admin_trans_insert(_input_dt ,chagam_username,_username,pay_amount2, admin_amount, chagam_amount1  )

                                                        
                            //4. KP_list에 추가  //보내는 사람=나
                            const trans_tp_admin_m = "관리자차감"//보내는 사람
                            const trans_tp1=chagam_username//차감자

                            console.log("보낸내역 kp_list에 insert",_phone, trans_tp1, _input_dt, pay_amount , admin_amount) 
                            
                            kpoint.kpoint_list_insert_m(chagamphone, trans_tp1,  _input_dt, pay_amount)

                            // //5. KP_list에 추가 //수신자
                            console.log("수신받은 금액 추가계산한 것 원장 갱신입력",chagamphone,chagam_amount1  )
                            const new_dt = moment(_input_dt).add(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
                            console.log("0.01초 더한시간",new_dt) 
                           
                            kpoint.kpoint_list_insert(adminphone, trans_tp_admin_m,  new_dt, pay_amount )


                            da = 1 
                            //1. 차감수정
                            kpoint.log_info_amount_update1(chagamphone, pay_amount )  //차감
                            
                            //2. 금액 증액정정 (관리자대표폰)
                            kpoint.log_info_amount_update2( adminphone, pay_amount )  //추가    

                            //6.전체거래내역list 
                            const phone = req.session.logined.phone 
                            const user = req.session.logined.username         
                            const tokenamount = req.session.logined.charge_amount
                            const sql = `
                                select 
                                *
                                from 
                                admin_trans
                                
                                order by admin_trans_time DESC
                                    `
                            const values = [phone]
                            connection.query(
                                sql, 
                                values, 
                                function(err, result){
                                    if(err){
                                        console.log(err)
                                    }else{     
                                        res.render('admintrans_list', {
                                            'resultt': result,
                                            'username' : trans_tp_admin_m, 
                                            'amount':admin_amount,
                                            'phone': adminphone
                        })}
                    })
                }})
            }})                    
        }})

//관리자 차감===========================================================

//admintrans list 출력
router.get('/admintrans_list', async (req, res)=>{
    
    if(!req.session.logined){
        res.redirect("/")
    }else{    
        const user = req.session.logined.username
        const kp_amount = req.session.logined.charge_amount   
        const phone = req.session.logined.phone 

        //kpoint 최신자료 순 정렬
        console.log("admin 최신자료 순 정렬 (kp_list) ")
        const sql =
            `
            select 
            *
            from 
            admin_trans
            
            order by admin_trans_time DESC
                `
         
        connection.query(
            sql, 
             
            function(err, result){
                if(err){
                    console.log(err)
                }
                console.log("sort 결과 출력가능 ")
                console.log("result=", result.length) 
                console.log("kp_amount =", kp_amount)  
                res.render('admintrans_list', {
                    'resultt': result,
                    username:user
                    
                    })
        })
    }})

//관리자 충전===========================================================
router.get('/admin_chargeok', function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
       
                res.render("admin_chargeok",{
                    'login_data': req.session.logined ,
                    // resultt:result2
                } )
            }
})


router.post('/admin_chargeok', async function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
        
        //입력 받기(전번 or 성명)
        const user_phone = await req.body.input_phone
        const user_name = await req.body.input_username
        console.log("admin_ok' ", user_phone,user_name)
        //log_info의 통계
        const sql2 = `
            select 
            * 
            from 
            log_info 
            where
            username=? || phone=?
            `
        const values2 =[user_name, user_phone ]   

        connection.query(
            sql2, 
            values2,
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                console.log("admin_ok's 렌더링해주는 result2=", result2)
                res.render("admin_charge",{
                    'login_data': req.session.logined ,
                    resultt:result2,
                    username:result2[0].username, 
                    recieptphone:result2[0].phone,
                    amount:result2[0].charge_amount,
                    state:0
                } )
            }
        })
    }})            
        
router.get('/admin_charge', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{

        data=1
        //회사원장 불러오기
        const _phone= "01080818962"
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
                    // req.session.logined=result2[0]
                    const balance =result2[0].charge_amount//회사 잔고
                    const _user= result2[0].username//회사명
                    
                    res.render('admin_charge', {
                        resultt:result2,
                        username:result2[0].username, 
                        recieptphone:result2[0].phone,
                        amount:result2[0].charge_amount,
                        state:0
                    })
}})}}) 


router.post('/admin_charge', async (req, res)=>{
    if(!req.session.logined){
    let data=0
    res.render('login', {
        'state' : data
        })
    }else{
        data=1
        const adminphone = req.body._admin//관리자대표폰
        const receiptphone = req.body._reciept//수신자폰
        const pay_amount = await req.body._sendpay.trim()//보낼금액

        const sql6 = `
            select 
            *
            from 
            log_info
            where 
            phone = ?
            `
        const values6 = [ adminphone]
        connection.query(
        sql6, 
        values6, 
        function(err, result2){
            if(err){
                console.log(err)
            }else{ 

                console.log("trans_amount =", adminphone,receiptphone, pay_amount)
                const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')//거래시간
                
                //보내는 관리자의  정보
                const _phone =  req.session.logined.phone  //보내는 관리자의 폰번호
                const _username = req.session.logined.username
                
   
                
                ///2. 수신자(친구) 금액 충전 정정
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
                            
                            //3. admin 거래내역 추가 
                            const reciept_amount = result6[0].charge_amount//수신자의 원장 충전금액
                            const reciept_username= result6[0].username.toString()
                            const reciept_amount1=parseInt(reciept_amount)+parseInt(pay_amount)
                            const admin_amount= parseInt(result2[0].charge_amount)-parseInt(pay_amount)
                            
                            console.log("admin 거래정보 리스트에 추가(충전)",_input_dt,_username,reciept_username, pay_amount , reciept_amount1, admin_amount)
                            kpoint.admin_trans_insert(_input_dt,_username,reciept_username, pay_amount , reciept_amount1 , admin_amount )

                                                        
                            //4. KP_list에 추가  //보내는 사람=나
                            const trans_tp = "관리자충전"//보내는 사람
                            const trans_tp1=reciept_username//받는사람

                            console.log("보낸내역 kp_list에 insert",_phone, trans_tp1, _input_dt, pay_amount , admin_amount) 
                            //const _pay_amount= parseInt(pay_amount)

                            kpoint.kpoint_list_insert_m(adminphone, trans_tp1,  _input_dt, pay_amount)

                            
                            // //5. KP_list에 추가 //수신자
                            
                            console.log("수신받은 금액 추가계산한 것 원장 갱신입력",receiptphone,reciept_amount1  )
                            
                            const new_dt = moment(_input_dt).add(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
                            console.log("0.01초 더한시간",new_dt) 
                            //const pay_amount1 = parseInt(pay_amount)*-1
                            kpoint.kpoint_list_insert(receiptphone, trans_tp,  new_dt, pay_amount)

                            const trans_tp2="event"
                            kpoint.kpoint_list_event_insert(receiptphone, trans_tp2,  new_dt, pay_amount )
                            
                            const trans_tp3="refferal"
                            kpoint.kpoint_list_refferal_insert(receiptphone, trans_tp3, new_dt, pay_amount )
    

                            da = 1 
                            //1. log_info 정보 감액수정(관리자대표폰)
                            kpoint.log_info_amount_update1(adminphone, pay_amount )  
            
                            //2. 수신자 금액 정정 (충전)
                            console.log("&&&&&&&&&&&&&&&&&", receiptphone,  pay_amount )
                            kpoint.log_info_amount_update( receiptphone, pay_amount )   //charge+event
                            kpoint.log_info_refferal_update(receiptphone, pay_amount)//refferal


                            //6.전체거래내역list 
                            const phone = req.session.logined.phone 
                            const user = req.session.logined.username         
                            const tokenamount = req.session.logined.charge_amount
                            const sql = `
                                select 
                                *
                                from 
                                admin_trans
                                
                                order by admin_trans_time DESC
                                    `
                            const values = [phone]
                            connection.query(
                                sql, 
                                values, 
                                function(err, result){
                                    if(err){
                                        console.log(err)
                                    }else{     
                                        res.render('admintrans_list', {
                                            'resultt': result,
                                            'username' :trans_tp, 
                                            'amount':admin_amount,
                                            'phone': adminphone,
                                            state:0
                                        
                        })}
                    })
                }})
            }})                    
        }})




//관리자 지급===========================================================
router.get('/admin_jigubok', function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
       
                res.render("admin_jigubok",{
                    'login_data': req.session.logined ,
                    // resultt:result2
                } )
            }
})


router.post('/admin_jigubok', async function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
        
        //입력 받기(전번 or 성명)
        const user_phone = await req.body.input_phone
        const user_name = await req.body.input_username
        console.log("admin_ok' ", user_phone,user_name)
        //log_info의 통계
        const sql2 = `
            select 
            * 
            from 
            log_info 
            where
            username=? || phone=?
            `
        const values2 =[user_name, user_phone ]   

        connection.query(
            sql2, 
            values2,
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                console.log("admin_ok's 렌더링해주는 result2=", result2)
                res.render("admin_jigub",{
                    'login_data': req.session.logined ,
                    resultt:result2,
                    username:result2[0].username, 
                    recieptphone:result2[0].phone,
                    amount:result2[0].charge_amount,
                    state:0
                } )
            }
        })
    }})            
        
router.get('/admin_jigub', async (req, res)=>{
    if(!req.session.logined){
        let data=0
        res.render('login', {
            'state' : data
        })
    }else{

        
        data=1
        //회사원장 불러오기
        const _phone= "01080818962"
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
                    // req.session.logined=result2[0]
                    const balance =result2[0].charge_amount//회사 잔고
                    const _user= result2[0].username//회사명
                    
                    res.render('admin_jigub', {
                        amount : balance,
                        phonenum : _phone,
                        username : _user,
                        state : 0
                    })
}})}}) 


router.post('/admin_jigub', async (req, res)=>{
    if(!req.session.logined){
    let data=0
    res.render('login', {
        'state' : data
        })
    }else{
        data=1
        const adminphone = req.body._admin//관리자대표폰
        const receiptphone = req.body._reciept//수신자폰
        const pay_amount = await req.body._sendpay.trim()//보낼금액

        const sql6 = `
            select 
            *
            from 
            log_info
            where 
            phone = ?
            `
        const values6 = [ adminphone]
        connection.query(
        sql6, 
        values6, 
        function(err, result2){
            if(err){
                console.log(err)
            }else{ 

                console.log("trans_amount =", adminphone,receiptphone, pay_amount)
                const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')//거래시간
                
                //보내는 관리자의  정보
                const _phone =  req.session.logined.phone  //보내는 관리자의 폰번호
                const _username = req.session.logined.username
                
   
                
                ///2. 수신자(친구) 금액 추가 정정
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
                            
                            //3. admin 거래내역 추가 
                            const reciept_amount = result6[0].charge_amount//수신자의 원장 충전금액
                            const reciept_username= result6[0].username.toString()
                            const reciept_amount1=parseInt(reciept_amount)+parseInt(pay_amount)
                            const admin_amount= parseInt(result2[0].charge_amount)-parseInt(pay_amount)
                            
                            console.log("admin 거래정보 리스트에 추가",_input_dt,_username,reciept_username, pay_amount , reciept_amount1, admin_amount)
                            kpoint.admin_trans_insert(_input_dt,_username,reciept_username, pay_amount , reciept_amount1 , admin_amount )

                                                        
                            //4. KP_list에 추가  //보내는 사람=나
                            const trans_tp = "관리자지급"//보내는 사람
                            const trans_tp1=reciept_username//받는사람

                            console.log("보낸내역 kp_list에 insert",_phone, trans_tp1, _input_dt, pay_amount , admin_amount) 
                            // const _pay_amount= parseInt(pay_amount)*-1

                            kpoint.kpoint_list_insert_m(adminphone, trans_tp1,  _input_dt, pay_amount)

                            
                            // //5. KP_list에 추가 //수신자
                            
                            console.log("수신받은 금액 추가계산한 것 원장 갱신입력",receiptphone,reciept_amount1  )
                            
                            const new_dt = moment(_input_dt).add(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
                            console.log("0.01초 더한시간",new_dt) 
                            //const pay_amount1 = parseInt(pay_amount)*-1
                            kpoint.kpoint_list_insert(receiptphone, trans_tp,  new_dt, pay_amount)

                            da = 1 
                            //1. log_info 정보 감액수정(관리자대표폰)
                            kpoint.log_info_amount_update1(adminphone, pay_amount )  
            
                            //2. 수신자 금액 정정 
                            console.log("&&&&&&&&&&&&&&&&&", receiptphone,  pay_amount )
                            kpoint.log_info_amount_update2( receiptphone, pay_amount )   

                            //6.전체거래내역list 
                            const phone = req.session.logined.phone 
                            const user = req.session.logined.username         
                            const tokenamount = req.session.logined.charge_amount
                            const sql = `
                                select 
                                *
                                from 
                                admin_trans
                                
                                order by admin_trans_time DESC
                                    `
                            const values = [phone]
                            connection.query(
                                sql, 
                                values, 
                                function(err, result){
                                    if(err){
                                        console.log(err)
                                    }else{     
                                        res.render('admintrans_list', {
                                            'resultt': result,
                                            'username' :trans_tp, 
                                            'amount':admin_amount,
                                            'phone': adminphone
                        })}
                    })
                }})
            }})                    
        }})

        
// 행운상추첨 포인트 지급
router.get('/admin_lucky', async (req, res)=>{
    if(!req.session.logined){
        res.redirect("/")
    }else{    
        const pay_amount = 200000//보낼금액
        //log_info의 통계
        const sql2 = `
            select 
            * 
            from 
            luckytest
           
            `
        connection.query(
            sql2, 
             
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                console.log("행운권 당첨자  =", result2.length)
                const adminphone="01025961010"
                connection.beginTransaction(function (err) {
                    if (err) {
                      console.log(err);
                      return;
                    }

                //반복
                for(let i=0; i<result2.length; i++){                     
                    console.log("i  =",i )  
                    const receiptphone = result2[i].phone
                    console.log("receiptphone = ", result2[i].phone)


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
                            if(result6.lenth==0){
                                console.log("조건에 맞는 사람이 없음")
                                return;
                            }else{
                              
                            console.log("result6[0].phone =", result6[0].phone)
                            const amount = result6[0].charge_amount
                            console.log("amount = ", result6[0].charge_amount)
                            const reciept_username=result6[0].username                             
                            //4. KP_list에 추가  //보내는 사람=나
                            const trans_tp = "행운상지급"//보내는 사람
                            const trans_tp1=reciept_username//받는사람
                            const _input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')//거래시간
                            const new_dt = moment(_input_dt).add(i, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
                            console.log("0.01초 더한시간",new_dt) 

                            console.log("보낸내역 kp_list에 insert", adminphone, trans_tp1, new_dt, pay_amount , amount) 
                            // const _pay_amount= parseInt(pay_amount)*-1

                            //kpoint.kpoint_list_insert_m(adminphone, trans_tp1,  new_dt, pay_amount)

                            
                            // //5. KP_list에 추가 //수신자
                            const reciept_amount1= parseInt(amount) + 200000
                            console.log("수신받은 금액 추가계산한 것 원장 갱신입력",receiptphone,reciept_amount1  )
                            
                            
                            kpoint.kpoint_list_insert(receiptphone, trans_tp,  new_dt, pay_amount)

                             
                            //1. log_info 정보 감액수정(관리자대표폰)
                            // kpoint.log_info_amount_update1(adminphone, pay_amount )  
            
                            //2. 수신자 금액 정정 
                            console.log("&&&&&&&&&&&&&&&&&", receiptphone,  pay_amount )
                            kpoint.log_info_amount_update2( receiptphone, pay_amount )  

                        }}});

                }
                connection.commit(function (err) {
                    if (err) {
                      console.log(err);
                      return;
                    }
                
                    console.log("트랜잭션 성공!");
                  });
                });

                res.render("admin_luckyjigub",{
                    'login_data': req.session.logined ,
                    resultt:result2,

                    state:0
                } )
            }
        })
    }})            



//db_update
router.get('/db_update', function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
      

}})


router.post('/db_update', async function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
        //관리자
        const memo_admin = req.session.logined.username

        // 유저가 보낸 데이터를 서버에서 대소로 대입
        const _pass =   req.body.input_pass
        const _numeric6 =   req.body.input_nemeric6
        const _nickname =   req.body.input_nickname
        const _refferal =   req.body.input_refferal

        const _amount =  parseInt(req.body.input_amount)
        const _tier =   req.body.input_tier
        const _memo =   req.body.input_memo
        const _phone =   req.body.input_phone
        const _username =  req.body.input_username
        
        
        const _memotime = moment().format('YYYY-MM-DDTHH:mm:ss')

        kpoint.log_info_update( _pass, _numeric6, _nickname,_refferal,  _amount, _phone)
        console.log('관리자 정보 갱신 완료 되었어요')

        kpoint.log_info_insert_memo(_phone,_username, _memo, _memotime, memo_admin)
        console.log('관리자 메모 정보 갱신 완료 되었어요')
        const sql2 = `
            select 
            * 
            from 
            log_info 
            where
            username=? || phone=?
            `
        const values2 =[_username, _phone ]   

        connection.query(
            sql2, 
            values2,
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                res.render("../admin/admin_index",{
                    'login_data': req.session.logined ,
                    resultt:result2
                } )
            }
    })
        
    }})

    router.get('/admin_ok', function(req, res){
        if(!req.session.logined){
            console.log('로그인정보가 없음')
            res.redirect("/")
        }else{
            console.log('관리자 모드 로그인 되었어요')
           
                    res.render("admin_ok",{
                        'login_data': req.session.logined 
                         
                    } )
                }
    })
   
    

   
router.post('/admin_ok', async function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
              
        //입력 받기(전번 or 성명)
        const user_phone = await req.body.input_phone
        const user_name = await req.body.input_username
        console.log("admin_ok' ", user_phone,user_name)
        //log_info의 통계
        const sql2 = `
            select 
            * 
            from 
            log_info 
            where
            username=? || phone=?
            `
        const values2 =[user_name, user_phone ]   

        connection.query(
            sql2, 
            values2,
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                console.log("admin_ok's 렌더링해주는 result2=", result2)
                res.render("db_update",{
                    'login_data': req.session.logined ,
                    resultt:result2,
                    uuser_name:result2[0].username, 
                    user_phone:result2[0].phone
                } )
            }
        })
    }})



    router.post('/admin_chagamok', async function(req, res){
        if(!req.session.logined){
            console.log('로그인정보가 없음')
            res.redirect("/")
        }else{
            console.log('관리자 모드 로그인 되었어요')
            
            //입력 받기(전번 or 성명)
            const user_phone = await req.body.input_phone
            const user_name = await req.body.input_username
            console.log("admin_ok' ", user_phone,user_name)
            //log_info의 통계
            const sql2 = `
                select 
                * 
                from 
                log_info 
                where
                username=? || phone=?
                `
            const values2 =[user_name, user_phone ]   
    
            connection.query(
                sql2, 
                values2,
            function(err, result2){
                if(err){
                    console.log(err)
                    res.send(err)
                }else{
                    console.log("admin_ok's 렌더링해주는 result2=", result2)
                    res.render("admin_chagam",{
                        'login_data': req.session.logined ,
                        resultt:result2,
                        user_name:result2[0].username, 
                        user_phone:result2[0].phone
                    } )
                }
            })
        }})
//관리자차감===============================================================





//score_update
router.get('/admin_scoreupdate', function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
      

}})


router.post('/admin_scoreupdate', async function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
        //관리자
        const memo_admin = req.session.logined.username

        // 유저가 보낸 데이터를 서버에서 대소로 대입
        const _pass =   req.body.input_pass
        const _numeric6 =   req.body.input_nemeric6
        const _nickname =   req.body.input_nickname
        const _refferal =   req.body.input_refferal

        const _amount =  parseInt(req.body.input_amount)
        const _tier =   req.body.input_tier
        const _memo =   req.body.input_memo
        const _phone =   req.body.input_phone
        const _username =  req.body.input_username
        
        
        const _memotime = moment().format('YYYY-MM-DDTHH:mm:ss')

        kpoint.log_info_update(  _pass , _numeric6, _nickname,_refferal,  _amount,  _tier, _phone)
        console.log('관리자 정보 갱신 완료 되었어요')

        kpoint.log_info_insert_memo(_phone,_username, _memo, _memotime, memo_admin)
        console.log('관리자 메모 정보 갱신 완료 되었어요')
        const sql2 = `
            select 
            * 
            from 
            log_info 
            where
            username=? || phone=?
            `
        const values2 =[_username, _phone ]   

        connection.query(
            sql2, 
            values2,
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                res.render("/admin_scoreupdate",{
                    'login_data': req.session.logined ,
                    resultt:result2
                } )
            }
    })
        
    }})



//관리자 스코어수정
router.get('/admin_scoreok', function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
                res.render("admin_scoreok",{
                    'login_data': req.session.logined ,
                } )
            }
})




router.post('/admin_scoreok', async function(req, res){
if(!req.session.logined){
    console.log('로그인정보가 없음')
    res.redirect("/")
}else{
    console.log('관리자 모드 로그인 되었어요')
   
    //입력 받기(전번 or 성명)
    const user_phone = await req.body.input_phone
    const user_name = await req.body.input_username
    console.log("admin_ok' ", user_phone,user_name)
    //log_info의 통계
    const sql2 = `
        select 
        * 
        from 
        score
        where
        username=? || phone=?
        `
    const values2 =[user_name, user_phone ]   

    connection.query(
        sql2, 
        values2,
    function(err, result2){
        if(err){
            console.log(err)
            res.send(err)
        }else{
            const _user_name=result2[0].username
            const _user_phone=result2[0].phone
            console.log("admin_score ok's 렌더링해주는 result2=", result2.length)
            res.render("admin_enterpay_list",{
                'login_data': req.session.logined ,
                enterpay:result2,
                username:_user_name, 
                phone:_user_phone
            } )
        }
    })
}})



router.get('/admin_enterpay_list', async (req, res)=>{
    if(!req.session.logined){
        res.redirect("/")
        let data =0
    }else{ 
        data=1 
          
        const phone = req.body._phone 
        const user = req.body._username   
        console.log("//////admin_enterpay_list=",phone,user )

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
                                    res.render('admin_enterpay_list', {
                                        ksfcres:result2,
                                        enterpay:result, 
                                        username : user, 
                                        
                                        phone: phone,
                                        login_data : req.session.logined,  
                    
                                    })}
    })}}})}})


//==========최다참가상
router.get('/admin_papago', async (req, res)=>{
        if(!req.session.logined){
            res.redirect("/")
            
        }else{ 
              
            console.log("//////papago_list======================" )
    
            //원장 읽어오기
            const sql = `
                select 
                *
                from 
                log_info
                
                `
            //const values = [phone]
            connection.query(
            sql, 
            //values, 
            function(err, result){
                if(err){
                    console.log(err)
                    
                }else{

                     //페스티벌참가횟수

                    console.log("제 5회 페스티벌참가자수 :", result.length)
                    let c=0
                    for(var i=0; i<result.length; ++i){
                    
                        const res=result[i].phone
                        //console.log("phone= ",i, res  )
                        const resuser=result[i].username
                        const resnick=result[i].nickname
                        
                        const sql = `
                            select 
                            *
                            from 
                            kp_list
                            where phone=? && transtype="festival"
                            `
                        const values = [res]
                        connection.query(
                        sql, 
                        values, 
                        function(err, result2){
                            if(err){
                                console.log(err)
                                
                            }else{
                            let len =result2.length
                            const papago = len

                            const sql = `
                                select 
                                *
                                from 
                                papagot
                                where phone=? 
                                `
                            const values = [res]
                            connection.query(
                            sql, 
                            values, 
                            function(err, result5){
                                if(err){
                                    console.log(err)
                                    
                                }else{

                                    if(result5.length){

                                         //참가횟수를 수정
                                        const sql=
                                            `
                                            update
                                            papagot
                                            set
                                            papago=?
                                            where phone = ?
                                            `

                                        const values = [ papago, res ]

                                        connection.query(
                                            sql,
                                            values,
                                            (err, result3)=>{
                                                if(err){   
                                                    console.log(err)}
                                                    else{

                                                        ++c
                                                    }})
                                    }else{


                                        //참가횟수를 기록
                                        const sql=
                                                `
                                                insert 
                                                into 
                                                papagot
                                                values (  ?, ?, ?, ? )
                                                `

                                        const values = [res, resuser, resnick, papago ]

                                        connection.query(
                                            sql,
                                            values,
                                            (err, result3)=>{
                                                if(err){   
                                                    console.log(err)}
                                                    else{

                                                        console.log("papagot insert= ",resuser )
                                            }})
                                    }
                            }})
                        }})
                    }//for
                    console.log("갱신횟수 = ?", c)

                    const sql = 
                        `
                        select 
                        *
                        from 
                        papagot
                        order by papago DESC 
                        `
                    connection.query(
                    sql, 
                        
                    function(err, result4){
                        if(err){
                            console.log(err)
                        }else{
                            console.log("result4",result4.length)
                            res.render('admin_papagolist', {
                                resultt:result4,
                                username :  req.session.logined.username,
                                
                                })}
                })}})}})

                    

    router.get('/admin_enterscore',async function(req, res){
        if(!req.session.logined){
            let data=0
            res.redirect("/")
        }else{
                        
            data=1
            const phone = req.session.logined.phone 
            const user = req.session.logined.username
             const no = req.query.no
            console.log("req.body.no",no)        
            console.log("//리스트 중 몇번째?를 선택했는지 전달받은 매개변수", no,phone,user)
           
            
            //1. 대회참가비 리스트 result9
            const sql9 = `
                select 
                *
                from 
                score
                where 
                phone = ?
                order by entertime DESC
                `
            const values9 = [phone]
            connection.query(
            sql9, 
            values9, 
            function(err, result9){
                if(err){
                    console.log(err)
                    let data=0
                }else{
                    console.log("//대회참가비 리스트result.length",result9.length )
                
                    
                //2. score테이블 리스트 중 클릭을 한 리스트의 값 즉 시간 result
                    const entertime11 = result9[no].entertime
                    console.log("내가 선택한 시간은 entertime :  ",entertime11)
                    console.log("내가 선택한 시간의 stroke :  ",result9[no].strok)

                    console.log("선택한 시간 레코드를 추출" )
                    //
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
                
        // ksfc에서 성별 가져오기  result2
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
                                            console.log("KSFC성별 추출이 하고 싶어서",result2)
                                            const gender=result2[0].gender
                                            console.log("KSFC성별 :",gender)
                                            //성별이 존재하면 성별과 참가시간을 추출하여 렌더링
                                            if(gender=="남"||gender=="여"){

                                                console.log("5등 이내의 성적과 합과 스코어 등록을 할 레코드를 enterscore 포스트로 렌더링")

                                                //만약 스코어카드가 이미 있으면 기 score내용은 수정 불가 하도록 조치
                                                if(result[0].scorepicture!=""){
                                                    res.render('admin_enterscore', {
                                                        no:no,
                                                        resultt : result, 
                                                        resultt2: result2,
                                                        username:user,
                                                        phone:phone,
                                                        login_data : req.session.logined,
                                                        timeresult:result[0],
                                                        entertime : entertime1,
                                                        state:data,
                                                        gender:gender
                                                    })
                                                }else{
                                                    res.render('admin_enterscore', {
                                                        no:no,
                                                        resultt : result, 
                                                        resultt2: result2,
                                                        username:user,
                                                        phone:phone,
                                                        login_data : req.session.logined,
                                                        timeresult:result[0],
                                                        entertime : entertime1,
                                                        state:data,
                                                        gender:gender
                                                })}
                                            }
                                        }})}})
                            }}
                )}})


router.post('/admin_enterscore', upload.single('_image'),async function(req, res){
    if(!req.session.logined){
        res.redirect("/")
    }else{
        let gender=""
        const n = req.body._n   
        console.log("-------------n=?",n)
        const sysrank=0
        const phone = req.body._phone 
        console.log("-------------phone=?",phone)
        const user = req.session.logined.username
        const _golfsys = await req.body.input_golfsys
        console.log("-------------input_golfsys?",_golfsys)
        const stroke = await req.body.input_strok  
        console.log("-------------input_strok?",stroke)

        //결제2000Kpoint 계산
        const _tokenamount = req.session.logined.charge_amount
        const tokenamount = parseInt(_tokenamount)+parseInt(-2000)  

//스코어카드 파일 기록
        // const _scorepicture = req.file.filename
        // console.log('_scorepicture=',_scorepicture);

        // const code = Math.floor(Math.random() * 10000000)
        // console.log("파일이름 중복방지 =",code)
        // const filename = code.toString()+_scorepicture; 
                
        // Save the file to the filesystem. 
        
        // Check if the file exists
        // filepath ="/uploads/"+_scorepicture
        //     console.log("filepath = ",filepath)
            // const image = fs.readFileSync(filepath)
//             // If the file exists, write it to the filesystem
//             if (!fs.existsSync(filepath)) {
//                 // fs.writeFile(filepath,JSON.stringify(filepath), (err) => {
//                     fs.writeFile(filepath,image, (err) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     } else {
//                         console.log('File saved successfully!');
//                     }
//                 })
//             } else {
//                 console.log('File does not exist!');
//             }}
    

// 나의 스코어
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
                        console.log("result2   미리보기=",result2.length )

//리스트에서 선택 한 것과 똑 같은 위치의 결제시간획득해서 score에 갱신등록
                        const entertime =result2[n].entertime

                        console.log("entertime과 갱신내용 미리보기=", entertime, stroke )
                        const _scorepicture=""
                        //enterscore_update
                        kpoint.enterscore_update(_golfsys, stroke,_scorepicture, entertime)
                        
//kpoint list 거래 전체 기록테이블에 추가 
                        const trans_tp = "festival"
                        const price ='2000'
                        const enterdate = moment().format('YYYY-MM-DDTHH:mm:ss')
                        //kpoint.kpoint_list_insert(phone, trans_tp,  enterdate, price, tokenamount )

//성별을 얻기 위해ksfc
const sql3 = `
select 
*
from 
ksfc
where 
phone = ?  
`
const values3 = [phone]
connection.query(
sql3, 
values3, 
function(err, result3){
if(err){
    console.log(err)
    }else{
        const ggender=result3[0].gender
        console.log("젠더가 구해지나??",ggender )
            

//나의 같은 골프 시스템, 스코어 순 내림차순 정열 5등 안의 score 준비+ 합계구하기
        const sql4 = `
            select 
            *
            from 
            score
            where 
            phone = ? && golfsys = ? 
            order by strok ASC
            `
        const values4 = [phone, _golfsys ]
        connection.query(
        sql4, 
        values4, 
        function(err, result4){
            if(err){
                console.log(err)
            }else{
                console.log("같은 성별, 시스템의 상위 5개 score출력을 위한 준비: ", result4.length)

//나의 같은 골프 시스템,  5위까지의 합    
                let len=0
                let sco_sum =0
                
                if(result4.length > 5){
                    len =5
                }else{
                    len = result4.length
                }
                if(len>0){
                    data=1
                }
                console.log("나와같은 골프시스템의 len : ", len)
                
                for(var i=0; i<len; i++){
                    //스코어가 갱신 안된것은 제외
                    if(result4[i].strok!='9999'){
                        sco_sum = sco_sum + parseInt(result4[i].strok)
                        console.log("strok, sco_sum = ", result4[i].strok, sco_sum )
                    }
                }
                console.log("scores_sum=", sco_sum)
                const scores_sum = sco_sum.toString()

//ksfc 5위내의 점수(베스트스코어)와 등수  ksfc에 입력(tier을 위해)
                const sql5 = `
                    select 
                    *
                    from 
                    ksfc
                    where 
                    golfsys = ? && gender=?
                    order by bestscore ASC
                    `
                const values5 = [_golfsys, ggender]
                connection.query(
                sql5, 
                values5, 
                function(err, result5){
                    if(err){
                        console.log(err)
                    }else{
                        console.log("같은 성별, 시스템의 상위 5개 score출력을 위한 준비: ", result5)
                        let sysrank=result5.length
                        for(var i=0; i<result5.length; i++){
                            if(scores_sum < parseInt(result5[i].bestscore)){
                                console.log("sysrank=", sysrank,scores_sum,result5[i].bestscore)
                                sysrank=sysrank-1
                                
                            }
                        }
                        console.log("loop end sysrank=", sysrank)
                        const _sysrank = sysrank+1//.toString()
                        console.log("ksfc_update=", scores_sum, _sysrank, phone, _golfsys)
                        kpoint.ksfc_update(scores_sum, _sysrank, phone, _golfsys ) 

//log_info에 tier 갱신      
                        const gender  = ggender 
                        console.log("tier_update=", phone,gender)  
                        kpoint.tier_update(phone,gender)
                         
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
                                    'amount' : tokenamount,
                                    'login_data' : req.session.logined,  
                                    'scores_sum' : scores_sum,
                                    'state':data,
                                    'len': len ,  
                                    gender:gender         
                                })
                            }})  
                        }})
            }})
}})}}) }}) 



router.get('/admin_enterscore_1',async function(req, res){
    if(!req.session.logined){
        let data=0
        res.redirect("/")
    }else{
                    
        data=1
        const phone = req.query.phone 
        const user = req.query.user
         const no = req.query.no
        console.log("```````````````````````````````req.body.no",no)        
        console.log("//리스트 중 몇번째?를 선택했는지 전달받은 매개변수", no,phone,user)
       
        
        //1. 대회참가비 리스트 result9
        const sql9 = `
            select 
            *
            from 
            score
            where 
            phone = ?
            order by entertime DESC
            `
        const values9 = [phone]
        connection.query(
        sql9, 
        values9, 
        function(err, result9){
            if(err){
                console.log(err)
                let data=0
            }else{
                console.log("//대회참가비 리스트result.length",result9.length )
            
                const n= result9.length
                const nn=parseInt(n)-parseInt(no)-1
            //2. score테이블 리스트 중 클릭을 한 리스트의 값 즉 시간 result
                const entertime11 = result9[nn].entertime
                console.log("내가 선택한 시간은 entertime :  ",entertime11)
                console.log("내가 선택한 시간의 stroke :  ",result9[nn].strok)

                console.log("선택한 시간 레코드를 추출" )
                //
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
                
        // ksfc에서 성별 가져오기  result2
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
                                                console.log("KSFC성별 추출이 하고 싶어서",result2)
                                                const gender=result2[0].gender
                                                console.log("KSFC성별 :",gender)
                                                //성별이 존재하면 성별과 참가시간을 추출하여 렌더링
                                                if(gender=="남"||gender=="여"){

                                                    console.log("5등 이내의 성적과 합과 스코어 등록을 할 레코드를 enterscore 포스트로 렌더링")

                                                    //만약 스코어카드가 이미 있으면 기 score내용은 수정 불가 하도록 조치
                                                    if(result[0].scorepicture!=""){
                                                        res.render('admin_enterscore_1', {
                                                            no:no,
                                                            nn:nn,
                                                            resultt : result, 
                                                            resultt2: result2,
                                                            username:user,
                                                            phone:phone,
                                                            login_data : req.session.logined,
                                                            timeresult:result[0],
                                                            entertime : entertime1,
                                                            state:data,
                                                            gender:gender
                                                        })
                                                    }else{
                                                        res.render('admin_enterscore_1', {
                                                            no:no,
                                                            nn:nn,
                                                            resultt : result, 
                                                            resultt2: result2,
                                                            username:user,
                                                            phone:phone,
                                                            login_data : req.session.logined,
                                                            timeresult:result[0],
                                                            entertime : entertime1,
                                                            state:data,
                                                            gender:gender
                                                    })}
                                                }
                                            }})}})
                                }}
                    )}})



router.post('/admin_enterscore_1', upload.single('_image'),async function(req, res){
    if(!req.session.logined){
        res.redirect("/")
    }else{
        let gender=""
        const no = req.body._n   
        console.log("-------------n?",no)
        console.log("-------------n?", req.body._time   )
        const sysrank=0
        const phone =req.body._phone 
        console.log("-------------phone?",phone)
        const user = req.session.logined.username
        const _golfsys = await req.body.input_golfsys
        console.log("-------------input_golfsys?",_golfsys)
        const stroke = await req.body.input_strok  
        console.log("-------------input_strok?",stroke)

        //결제2000Kpoint 계산
        const _tokenamount = req.session.logined.charge_amount
        const tokenamount = parseInt(_tokenamount)+parseInt(-2000)  

//스코어카드 파일 기록

        const _scorepicture = req.file.filename
        console.log('_scorepicture=',_scorepicture);

        // const code = Math.floor(Math.random() * 10000000)
        // console.log("파일이름 중복방지 =",code)
        // const filename = code.toString()+_scorepicture; 
                
        // Save the file to the filesystem. 
        
        // Check if the file exists
        // filepath ="/uploads/"+_scorepicture
        //     console.log("filepath = ",filepath)
            // const image = fs.readFileSync(filepath)
//             // If the file exists, write it to the filesystem
//             if (!fs.existsSync(filepath)) {
//                 // fs.writeFile(filepath,JSON.stringify(filepath), (err) => {
//                     fs.writeFile(filepath,image, (err) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     } else {
//                         console.log('File saved successfully!');
//                     }
//                 })
//             } else {
//                 console.log('File does not exist!');
//             }}

        //나의 스코어를 입력최근순서대로 선택
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
                console.log("result2   미리보기=",result2.length )
                const n= result2.length
                const nn=parseInt(n)-parseInt(no)-1
            //2. score테이블 리스트 중 클릭을 한 리스트의 값 즉 시간 result
                const entertime = result2[nn].entertime
                console.log("내가 선택한 시간은 entertime :  ",entertime)
                
//리스트에서 선택 한 것과 똑 같은 위치의 결제시간획득해서 score에 갱신등록
               

                console.log("entertime과 갱신내용 미리보기=", entertime, stroke,_scorepicture )
                // const _scorepicture=""
                //enterscore_update
                kpoint.enterscore_update(_golfsys, stroke,_scorepicture, entertime)
                        
//kpoint list 거래 전체 기록테이블에 추가 
                const trans_tp = "festival"
                const price ='2000'
                const enterdate = moment().format('YYYY-MM-DDTHH:mm:ss')
                //kpoint.kpoint_list_insert(phone, trans_tp,  enterdate, price )

//성별을 얻기 위해ksfc
                const sql3 = `
                    select 
                    *
                    from 
                    ksfc
                    where 
                    phone = ?  
                    `
                const values3 = [phone]
                connection.query(
                sql3, 
                values3, 
                function(err, result3){
                    if(err){
                        console.log(err)
                        }else{
                            const ggender=result3[0].gender
                            console.log("젠더가 구해지나??",ggender )
                                        

//나의 같은  골프 시스템, 스코어 순 내림차순 정열 5등 안의 score 준비+ 합계구하기
                            const sql4 = `
                                select 
                                *
                                from 
                                score
                                where 
                                phone = ? && golfsys = ? 
                                order by strok ASC
                                `
                            const values4 = [phone, _golfsys]
                            connection.query(
                            sql4, 
                            values4, 
                            function(err, result4){
                                if(err){
                                    console.log(err)
                                }else{
                                    console.log("같은 시스템의 상위 5개 score출력을 위한 준비: ", result4.length)

//나의 같은 골프 시스템,  5위까지의 합    
                                    let len=0
                                    let sco_sum =0
                                    
                                    if(result4.length > 5){
                                        len =5
                                    }else{
                                        len = result4.length
                                    }
                                    if(len>0){
                                        data=1
                                    }
                                    console.log("나와같은 골프시스템의 len : ", len)
                                    
                                    for(var i=0; i<len; i++){
                                        //스코어가 갱신 안된것은 제외
                                        if(result4[i].strok!='9999'){
                                            sco_sum = sco_sum + parseInt(result4[i].strok)
                                            console.log("strok, sco_sum = ", result4[i].strok, sco_sum )
                                        }
                                    }
                                    console.log("scores_sum=", sco_sum)
                                    const scores_sum = sco_sum.toString()

//ksfc 5위내의 점수(베스트스코어)와 등수  ksfc에 입력(tier을 위해)
                                    const sql5 = `
                                        select 
                                        *
                                        from 
                                        ksfc
                                        where 
                                        golfsys = ? && gender=?
                                        order by  bestscore  ASC
                                        `
                                    const values5 = [_golfsys, ggender]
                                    connection.query(
                                    sql5, 
                                    values5, 
                                    function(err, result5){
                                        if(err){
                                            console.log(err)
                                        }else{
                                            console.log("같은 성별, 시스템의 상위 5개 score출력을 위go-------------: ", result5.length)
                                            let sysrank=result5.length
                                            for(var i=0; i<result5.length; i++){
                                                if(scores_sum < parseInt(result5[i].bestscore)){
                                                    sysrank=sysrank-1
                                                    
                                                }
                                            }
                                            const _sysrank = sysrank.toString()
                                            console.log("ksfc_update=", scores_sum, _sysrank, phone, _golfsys)
                                            kpoint.ksfc_update(scores_sum, _sysrank, phone, _golfsys ) 

//log_info에 tier 갱신      
                                            const gender  = ggender 
                                            console.log("tier_update=", phone,gender)  
                                            kpoint.tier_update(phone,gender)

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
                                                        'amount' : tokenamount,
                                                        'login_data' : req.session.logined,  
                                                        'scores_sum' : scores_sum,
                                                        'state':data,
                                                        'len': len ,  
                                                        gender:gender         
                                                    })
                                                }})  
                                            }})
                                        }})
                            }})}}) }}) 



return router

}