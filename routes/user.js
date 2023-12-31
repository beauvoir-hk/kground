//express, router를 가지고 온다
const express = require('express')
const router = express.Router()
const session = require('express-session')
//현재의 시간을 알려주는 모듈모드
const moment = require('moment')

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

// Twilio에 연결합니다
const twilioClient = require('twilio')(process.env.accountSid, process.env.authToken)

module.exports = ()=>{
    //해당 파일에서 기본 url : localhost:3000/ 

    router.get("/", (req, res)=>{
        if(!req.session.logined){
            console.log("처음인가??")
            // res.redirect('/')
            res.redirect('/')
        }else{
            res.redirect('/index')
        }
    
    })

    //공지
    router.get("/notice", async (req, res)=>{
        if(!req.session.logined){
            console.log("?????")
            res.redirect('/')
             
        }else{
            res.redirect('/notice')
        }
    
    })
                 
    

//localhost:3000/ login [post] 형식으로 요청 시
router.post("/login", async (req, res)=>{
    // 로그인 화면에서 유저가 입력 id, pass값을 변수에 대입
    const _phone = await req.body.input_phone.trim()
    const _pass = await req.body.input_pass.trim()
    console.log('로그인정보', _phone, _pass)

    // DB에 있는 table에 id와 password가 유저가 입력한 데이터와
    // 같은 데이터가 존재하는가 확인
    // 쿼리문을 이용하여 데이터의 존재 유무를 확인
    const sql=
        `
        select 
        * 
        from 
        log_info 
        where 
        phone = ? 
        and 
        pass = ?
        `
    const values = [_phone, _pass]
    connection.query(
        sql,
        values,
        (err, result)=>{
            if(err){
                console.log('login error XXXXXXXX', err)
                res.send(err)
                res.redirect('/?data=false')
            }else{
                console.log("문법오류는 없음")
                // 로그인이 성공하는 조건?
                // 데이터가 존재하면 로그인 성공
                // 데이터가 존재하지 않는다면 로그인이 실패
                // sql 에서 데이터를 받을때 [{id : xxx, password:xxx}]
                if(result.length != 0){
                    // 로그인이 성공하는 조건
                    console.log('db에 로그인한 정보가 있어요', result[0])
                        
                    req.session.logined = result[0]
                    logphone = result[0].phone
                    logpass= result[0].pass

                   
                        //로그인 성공
                    res.render('index',{
                            login_data:req.session.logined,
                            amount:req.session.logined.charge_amount,
                        })    
                    // }
                }else{
                    console.log('로그인 실패')
                    res.render('login',{
                        state:false
                    })    
                }
            }})
            } )


    // 회원 가입 (localhost:3000/user/ signup주소로 요청시)
    router.get('/signup', (req, res)=>{
        res.render('signup.ejs')
    })

    router.post('/signup', async (req, res)=>{

        // 유저가 보낸 데이터를 서버에서 대소로 대입
        const _phone = await req.body.input_phone.trim()
        const _pass = await req.body.input_pass.trim()
        const _username =await  req.body.input_username.trim()
        const _nickname =await  req.body.input_nickname.trim()
        const _gender = await req.body.input_gender.trim()
        const _birth =await req.body.input_birth.trim()
        const _jiyeok =await  req.body.input_jiyeok.trim()
        const _refferal = await req.body.input_refferal.trim()
        const _numeric6= await req.body.input_numeric6.trim()
        // const date = moment()
        // const input_dt= date.format('YYYY-MM-DD HH:mm:ss')
        const input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')
        console.log(_phone, _pass, _username, _nickname,_gender, 
            _birth,_jiyeok, _refferal, _numeric6 , input_dt )

        const tier = "1"
        const _amount = "5000"
        // 유저가 보내온 데이터를 가지고 sql user_info table에 데이터를 삽입

        const sql = `
                insert 
                into 
                log_info 
                values ( ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?)
                `
        const values =
            [_phone, _pass, _username, _nickname,_gender,
                _birth, _jiyeok, _refferal, _numeric6, _amount,tier,input_dt] 

            connection.query(
                sql,
                values,
                (err, result)=>{
                    if(err){   
                        console.log(err)}
                        else{
                                console.log("회원가입")
                                //KSFC에 추가
                                const game_number = 6
                                const golf_sys="GolfZon"
                                const bestscore=9999
                                const sysrank=0
                                console.log("ksfc_insert :",_phone, _username,game_number,_gender, _jiyeok, _birth, golf_sys,bestscore, sysrank,input_dt)
                                kpoint.ksfc_insert(_phone, _username,game_number,_gender, _jiyeok, _birth, golf_sys,bestscore, sysrank,input_dt)
                                

                               const gphone = "+82"+ _phone
                                console.log("회원가입 폰 =",gphone)
                                
                                twilioClient.messages.create({
                                    body: '케이그라운드와 함께 해주셔서 감사합니다. 회원가입이 완료되었습니다 ID =   ' + _phone ,
                                    from: process.env.kphonenumber,
                                    to: gphone
                                    })
                                    .then(message => console.log("회원가입 ok(kground)----", gphone,message.sid))

                                //본사에메세지
                                const ggphone = "+8201025961010" 
                                console.log(" 본사 폰  =",ggphone)
                                // 문자인증 코드를 생성합니다.
                                // 랜덤으로 4자리 인증 코드를 만든다.
                                
                                console.log("process.env.kphonenumber=",process.env.kphonenumber)
                        
                                twilioClient.messages.create({
                                    body: '케이그라운드 회원가입완료:   ' + _phone ,
                                    from: process.env.kphonenumber,
                                    to: ggphone
                                    })
                                    .then(message => console.log("회원가입 ment ok(----",ggphone, message.sid))    
                                
                                
                                    res.render("login",{
                                        phone:_phone,
                                        login_data:req.session.logined,
                                        state:1
                                
                                })
                            }
                        })})    
            
            


    router.get('/index', async function(req, res){
        if(!req.session.logined){
            console.log('로그인정보가 없음')
            res.redirect("/")
        }else{
             
            //원장을 다시 읽을 준비
            const phone=req.session.logined.phone
            //const login_data = req.session.logined
            console.log('로그인 되었어요 원장다시 읽기준비',login_data)   
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
                        //session수정
                        req.session.logined= result[0]
                        console.log("index refresh -->result[0].amount",result[0].charge_amount)
                        res.render('index.ejs', {
                            login_data: req.session.logined, 
                            amount:result[0].charge_amount,
                            phone:result[0].phone
                    })}
                }}) }})

   
    // 회원 탈퇴 sql api
    router.get('/drop2', function(req, res){

        if(!req.session.logined){
            res.redirect("/")
        }else{
            res.render('drop2.ejs',{
                login_data : req.session.logined
            })
        }
    })


    router.get('/check_pass', function(req, res){
        // 유저가 보낸 데이터를 변수에 대입
        const input_pass = req.query._pass
        console.log(input_pass)
        res.send(input_pass == req.session.logined.pass)
    })

    // localhost:3000/logout get형태의 주소 생성
    router.get('/logout', function(req, res){
        // 로그아웃은 session의 data를 삭제
        req.session.destroy(function(err){
            if(err){
                console.log(err)
            }else{
                res.redirect("/")
            }
        })
    })


    router.get('/my_3', async function(req, res){
        if(!req.session.logined){
            console.log('로그인 정보 없음')
            res.redirect("/")
        }else{

            res.render("my_3",{
                login_data:req.session.logined
            })
        }
    })

    router.post('/my_3', async function(req, res){
        if(!req.session.logined){
            console.log('로그인 정보 없음')
            res.redirect("/")
        }else{
            const _phone=req.session.logined.phone 

                const sql =
                    `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                `
            const values =[_phone] 

            connection.query(
            sql,
            values,
            (err, result)=>{
                if(err){   
                    console.log(err)}
                    else{


                    //수정입력
                    const _nickname =   req.body.input_nickname.trim()
                    const _gender =   req.body.input_gender
                    const _birth =  req.body.input_birth.trim()
                    const _jiyeok =   req.body.input_jiyeok
                    const _refferal =   req.body.input_refferal.trim()
                    const golf_sys = req.body.input_golfsys
                    // const date = moment()
                    // const input_dt= date.format('YYYY-MM-DD HH:mm:ss')
                        
                    console.log( _nickname,_gender, _birth,_jiyeok, _refferal  )

                    // 유저가 보내온 데이터를 가지고 sql user_info table에 데이터를 삽입

                    const sql = `
                        update
                        log_info
                        set
                        nickname=?,
                        gender=?,
                        birth =?,
                        jiyeok=?,
                        refferal=?
                        where
                        phone = ?
                        `
                    const values =
                        [_nickname,_gender,_birth, _jiyeok, _refferal, _phone] 

                        connection.query(
                        sql,
                        values,
                        (err, result)=>{
                            if(err){   
                                console.log(err)}
                                else{
                                    if(result.affectedRows==0){
                                        console.log("회원정보수정완료이 완료되지 못했습니다")
                                        res.render("my",
                                        {
                                            state:0
                                        })
                                    }else{
                                        //KSFC에 추가
                                        const _phone=req.session.logined.phone  
                                        const _username=req.session.logined.username
                                        const _input_dt=req.session.logined.logdate
                                        
                                        let st=0
                                        const sql=
                                            `
                                            SELECT
                                            *
                                            FROM
                                            ksfc
                                            WHERE phone = ?
                                            `
                                        const values=[_phone ]
                                        connection.query(
                                        sql,
                                        values,
                                        (err, result2)=>{
                                            if(err){
                                                console.error(err)
                                            }else{
                                                console.log("my ksfc 확인:",result2.length )
                                                for(var i=0;i<result2.length; ++i){
                                                    console.log("golf_sys==result2[i].golfsys:",golf_sys==result2[i].golfsys )
                                                    if(golf_sys==result2[i].golfsys){
                                                        st=1
                                                        break
                                                    }else{
                                                        st=0
                                                    }
                                                }
                                                if(result2.length<1 || st!=1){
                                                    console.log("result2.length<1 || st!=1 :",result2.length<1 || st!=1 )
                                                    //등록된 ksfc가 없다 insert
                                                    const game_number = 6
                                                    const bestscore=9999
                                                    const sysrank=0
                                                    const new_dt = moment().format('YYYY-MM-DDTHH:mm:ss')
                                                    console.log(" new_dt =",new_dt )
                                                    console.log("ksfc_insert" ,_phone, _username, game_number,_gender, _jiyeok, _birth, golf_sys,bestscore, sysrank,new_dt  )
                                                    kpoint.ksfc_insert(_phone, _username, game_number,_gender, _jiyeok, _birth, golf_sys,bestscore, sysrank,new_dt)
                                                    console.log("my ksfc 정보 추가완료")
                                                    res.redirect("index")
                                                }else{ 

                                                    // ksfc가 이미 존재하면 수정
                                                    let bestscore=9999
                                                    let sysrank=0
                                                    //중복시스템일 때는 수정
                                                    for(var i=0; i<result2.length ; ++i){
                                                        if(golf_sys==result2[i].golfsys){
                                                            if(bestscore > parseInt(result2[i].bestscore)){
                                                                bestscore = result2[i].bestscore
                                                            }else{
                                                                console.log("베스트스코어가 아님")
                                                            }
                                                            if(sysrank < parseInt(result2[i].sysrank)){
                                                                sysrank = result2[i].sysrank
                                                            }else{
                                                                console.log("베스트순위가 아님")
                                                            }
                                                                                                           
                                                        const  _bestscore = bestscore
                                                        const _sysrank=  sysrank
                                                        const _golfsys=golf_sys
                                                        
                                                        kpoint.ksfc_update(_bestscore, _sysrank, _phone, _golfsys )
                                                        console.log("myksfc 정보 수정완료")
                                                        }
                                                    }
                                                    res.redirect("index")
                                                    }
                                                } 
                                })}}}) 
                    }})
}})


    router.get('/my_2', async function(req, res){
        if(!req.session.logined){
            console.log('로그인 정보 없음')
            res.redirect("/")
        }else{

            res.render("my_2",{
                login_data:req.session.logined
            })
        }
    })



    router.get('/my_1', async function(req, res){
        if(!req.session.logined){
            console.log('로그인 정보 없음')
            res.redirect("/")
        }else{

            res.render("my_1",{
                login_data:req.session.logined
            })
        }
    })



    router.get('/my', async function(req, res){
        if(!req.session.logined){
            console.log('로그인 정보 없음')
            res.redirect("/")
        }else{

            res.render("my",{
                login_data:req.session.logined
            })
        }
    })

    router.post('/my', async function(req, res){
        if(!req.session.logined){
            console.log('로그인 정보 없음')
            res.redirect("/")
        }else{
            const _phone=req.session.logined.phone 

                const sql =
                    `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                `
            const values =[_phone] 

            connection.query(
            sql,
            values,
            (err, result)=>{
                if(err){   
                    console.log(err)}
                    else{


                    //수정입력
                    const _nickname =   req.body.input_nickname.trim()
                    const _gender =   req.body.input_gender
                    const _birth =  req.body.input_birth.trim()
                    const _jiyeok =   req.body.input_jiyeok
                    const _refferal =   req.body.input_refferal.trim()
                    const golf_sys = req.body.input_golfsys
                    // const date = moment()
                    // const input_dt= date.format('YYYY-MM-DD HH:mm:ss')
                        
                    console.log( _nickname,_gender, _birth,_jiyeok, _refferal  )

                    // 유저가 보내온 데이터를 가지고 sql user_info table에 데이터를 삽입

                    const sql = `
                        update
                        log_info
                        set
                        nickname=?,
                        gender=?,
                        birth =?,
                        jiyeok=?,
                        refferal=?
                        where
                        phone = ?
                        `
                    const values =
                        [_nickname,_gender,_birth, _jiyeok, _refferal, _phone] 

                        connection.query(
                        sql,
                        values,
                        (err, result)=>{
                            if(err){   
                                console.log(err)}
                                else{
                                    if(result.affectedRows==0){
                                        console.log("회원정보수정완료이 완료되지 못했습니다")
                                        res.render("my",
                                        {
                                            state:0
                                        })
                                    }else{
                                        //KSFC에 추가
                                        const _phone=req.session.logined.phone  
                                        const _username=req.session.logined.username
                                        const _input_dt=req.session.logined.logdate
                                        
                                        let st=0
                                        const sql=
                                            `
                                            SELECT
                                            *
                                            FROM
                                            ksfc
                                            WHERE phone = ?
                                            `
                                        const values=[_phone ]
                                        connection.query(
                                        sql,
                                        values,
                                        (err, result2)=>{
                                            if(err){
                                                console.error(err)
                                            }else{
                                                console.log("my ksfc 확인:",result2.length )
                                                for(var i=0;i<result2.length; ++i){
                                                    console.log("golf_sys==result2[i].golfsys:",golf_sys==result2[i].golfsys )
                                                    if(golf_sys==result2[i].golfsys){
                                                        st=1
                                                        break
                                                    }else{
                                                        st=0
                                                    }
                                                }
                                                if(result2.length<1 || st!=1){
                                                    console.log("result2.length<1 || st!=1 :",result2.length<1 || st!=1 )
                                                    //등록된 ksfc가 없다 insert
                                                    const game_number = 6
                                                    const bestscore=9999
                                                    const sysrank=0
                                                    const new_dt = moment().format('YYYY-MM-DDTHH:mm:ss')
                                                    console.log(" new_dt =",new_dt )
                                                    console.log("ksfc_insert" ,_phone, _username, game_number,_gender, _jiyeok, _birth, golf_sys,bestscore, sysrank,new_dt  )
                                                    kpoint.ksfc_insert(_phone, _username, game_number,_gender, _jiyeok, _birth, golf_sys,bestscore, sysrank,new_dt)
                                                    console.log("my ksfc 정보 추가완료")
                                                    res.redirect("index")
                                                }else{ 

                                                    // ksfc가 이미 존재하면 수정
                                                    let bestscore=9999
                                                    let sysrank=0
                                                    //중복시스템일 때는 수정
                                                    for(var i=0; i<result2.length ; ++i){
                                                        if(golf_sys==result2[i].golfsys){
                                                            if(bestscore > parseInt(result2[i].bestscore)){
                                                                bestscore = result2[i].bestscore
                                                            }else{
                                                                console.log("베스트스코어가 아님")
                                                            }
                                                            if(sysrank < parseInt(result2[i].sysrank)){
                                                                sysrank = result2[i].sysrank
                                                            }else{
                                                                console.log("베스트순위가 아님")
                                                            }
                                                                                                           
                                                        const  _bestscore = bestscore
                                                        const _sysrank=  sysrank
                                                        const _golfsys=golf_sys
                                                        
                                                        kpoint.ksfc_update(_bestscore, _sysrank, _phone, _golfsys )
                                                        console.log("myksfc 정보 수정완료")
                                                        }
                                                    }
                                                    res.redirect("index")
                                                    }
                                                } 
                                })}}}) 
                    }})
}})


router.post('/change_pass', async function(req, res){
    const input_new_pass = await req.body.input_pass.trim()
    const input_new_pass6 = await req.body.input_paypass6.trim()
    const phone=req.body._phone.trim()
    console.log(input_new_pass)
    state=0    
    const sql = `
        update
        log_info
        set
        pass = ?,
        numeric6 = ?
        where
        phone = ?
        `
    const values = [input_new_pass, input_new_pass6,  phone]
    connection.query(
        sql, 
        values, 
        function(err, result){
            if(err){
                console.log(err)
                res.send(err)
            }else{

                console.log('papagot sql',input_new_pass, input_new_pass6,  phone)
                console.log("로그인비밀번호 변경성공", result)
                res.render("login")
                }})
 })


router.post('/change_pass1', async function(req, res){
    const input_new_pass = await req.body.input_pass.trim()
    console.log(input_new_pass)

    const phone=req.body._phone.trim()
    console.log(phone)

    state=0    
    const sql = `
                update
                log_info
                set
                pass = ?
                where
                phone = ?
                `
    const values = [input_new_pass, phone]
    connection.query(
        sql, 
        values, 
        function(err, result){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                console.log('papagot sql',input_new_pass, phone)
                console.log("로그인비밀번호 변경성공", result)

                res.render("login")
                
            } } )
        })



 router.post('/change_pass2', async function(req, res){
        
    const phone =   req.body._phone.trim()
    
    console.log("phone=", phone)

    const input_new_pass = await req.body.input_pass.trim()
    console.log("input_new_pass=",input_new_pass)

    state=0    
    const sql = `
                update
                log_info
                set
                pass = ?
                where
                phone = ?
                `
    const values = [input_new_pass, phone]
    connection.query(
        sql, 
        values, 
        function(err, result){
            if(err){
                console.log(err)
                res.send(err)
            }else{                
                if(result.affectedRows!=0){
                    console.log('papagot sql',input_new_pass, phone)
                    console.log("로그인비밀번호 변경성공", result)
                    //로그인비밀번호변경 성공시 다시 로그인으로
                    res.render("login",{  
                        phone:phone,
                        state:1
                    })
                }else{
                    console.log("로그인비밀번호이 변경안되었어요????", result)
                }
            }
    })})
                


        
router.post('/change_paypass6', async function(req, res){
    const phone=req.body.phone.trim()
    const input_new_pass6 = await req.body.input_paypass6.trim()
    console.log(input_new_pass6)
    
    const sql = `
        update
        log_info
        set
        numeric6 = ?
        where
        phone = ?
        `
    const values = [input_new_pass6, phone]
    connection.query(
        sql, 
        values, 
        function(err, result){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                if(result.length!=0){
                    console.log('papagot sql',input_new_pass6, phone)
                    console.log("결제비밀번호 변경성공", result)
                    res.render("index",{
                        state:1,
                        amount:req.session.logined.charge_amount,
                        login_data:req.session.logined
                })
                }else{
                    console.log("결제비밀번호 변경이 안되었어요????", result)

                }
            }
})})
                        

router.get('/check_id', function(req, res){
    const input_id = req.query._id
    const state =req.query.state
    console.log("state =",state )
    if(state==1){
        const input_id = req.query._id
        const sql = `
            select 
            *
            from 
            ksfc
            where 
            phone = ?
        `
        const values = [input_id]
        connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log(err)
                }else{
                    //전번으로 select한 db의 데이터가 있으면 result!=0
                    if(result.length != 0){
                        res.send(false)
                        // res.render("verify",{
                        //     'phone' : input_id
                        }else{
                            res.send(true)
                            }
                }
            }
        )}else{
                const sql = `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                 `
                const values = [input_id]
                connection.query(
            
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                    }else{
                        //전번으로 select한 db의 데이터가 있으면 result!=0
                        if(result.length != 0){
                            res.send(false)
                            // res.render("verify",{
                            //     'phone' : input_id
                            }else{
                                res.send(true)
                                }
                        }
                    }
                )}
    })



router.get('/check_numeric6', function(req, res){
        const input_numeric6 = req.query._numeric6
        const input_id = req.query._id
        const state =req.query.state
        console.log("state =",state )
        const sql = `
            select 
            *
            from 
            log_info
            where 
            phone = ?
                `
            const values = [input_id]
            connection.query(
        
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log(err)
                }else{
                    //전번으로 select한 db의 데이터가 있으면 result!=0
                    if(result.length != 0){
                        if(result[0].numeric6==input_numeric6){
                        res.send(false)
                        // res.render("verify",{
                        //     'phone' : input_id
                        }else{
                            res.send(true)
                            }
                    }
                }}
            )})
                    

router.get('/check_admin', function(req, res){
    const input_id = req.query._id

    console.log("input_id =",input_id )
    

        const sql = `
            select 
            *
            from 
            admin
            where 
            phone = ?
        `
        const values = [input_id]
        connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log(err)
                }else{
                    //전번으로 select한 db의 데이터가 있으면 result!=0
                    if(result.length == 0){
                        res.send(false)
                        
                        }else{
                            res.send(true)
                            }
                }
            }
        )})
    

//회원인지확인(KP거래)
    router.get('/check_id1', function(req, res){
        const input_id = req.query._id
        const state =req.query.state
        console.log("state =",state )

        const sql = `
            select 
            *
            from 
            log_info
            where 
            phone = ?
            `
        const values = [input_id]
        connection.query(
    
        sql, 
        values, 
        function(err, result){
            if(err){
                console.log(err)
            }else{
                //전번으로 select한 db의 데이터가 있으면 result!=0
                if(result.length != 0){
                    res.send(true)
                    // res.render("verify",{
                    //     'phone' : input_id
                    }else{
                        res.send(false)
                        } 
                    } }
        )})

    router.get('/auth6', async  (req, res) => {
        const _state=3
        const _dir= await req.body.dir 
        const _st=0
        if(req.session.logined){
            const phone= req.session.logined.phone
            res.render("auth6",{
                phone:phone,
                state:_state,
                st:_st,
                dir:_dir
    })}})
        

    // 비밀번호 찾기
    router.post('/auth6', async  (req, res) => {
        let _st=0//전번입력받아진행
        const _dir= await req.body.dir 
        const phone = req.session.logined.phone
        if(req.session.logined){
            
             _st=1
        }
        console.log("phone =",phone )

        const gphone = "+82"+ phone
        console.log("auth 실행 들어옴 gphone =",gphone)
        // 문자인증 코드를 생성합니다.
        // 랜덤으로 4자리 인증 코드를 만든다.
        const auth_code = Math.floor(Math.random() * 10000)
        console.log("auth 실행 들어옴 auth_code =",auth_code)
        const expire = new Date()
        console.log("auth 실행 들어옴 expire =",expire)
        console.log("process.env.kphonenumber=",process.env.kphonenumber)

        //db에 기록
        const sql = `
            insert 
            into 
            auth
            values (?,?,?)
        `
        const values = [auth_code,phone,expire]
        
        connection.query(
            sql,
            values,
            (err, result)=>{
                if(err){   
                    console.log(err)}
                    else{
                        if (result.length == 0) {
                            console.log("문자인증건수 하나도 없다네")

                        } else {
                            
                            
                            twilioClient.messages.create({
                                body: 'GolfPlatform 케이그라운드 인증번호 :   ' + auth_code,
                                from: process.env.kphonenumber,
                                to: gphone
                                })
                                .then(message => console.log("verify.ejs----", message.sid))
                                    // 문자인증 코드를 MySQL에서 조회합니다.
                                res.render('auth6',{
                                    phone : phone,
                                    state:1,
                                    st:_st,
                                    dir:_dir

                    })} }
        }) } )


    router.get('/auth2', async  (req, res) => {
        const _state=3
        const _dir= 2//로그인만변경
        const _st=0//기로그인
        const phone = req.session.logined.phone
        if(req.session.logined){
            res.render("auth2",{
                phone:phone,
                state:_state,
                st:_st,
                dir:_dir
    })}})
        

    // 비밀번호 찾기
    router.post('/auth2', async  (req, res) => {
            let _st=0//전번입력받아진행
            
        if(req.session.logined){
                _st=1
        }
        const phone = req.body._phone.trim()
        console.log("req.body.phone =",phone )
        
       
        const gphone = "+82"+ phone
        console.log("auth 실행 들어옴 gphone =",gphone)
        // 문자인증 코드를 생성합니다.
        // 랜덤으로 4자리 인증 코드를 만든다.
        const auth_code = Math.floor(Math.random() * 10000)
        console.log("auth 실행 들어옴 auth_code =",auth_code)
        const expire = new Date()
        console.log("auth 실행 들어옴 expire =",expire)
        console.log("process.env.kphonenumber=",process.env.kphonenumber)

        //db에 기록
        const sql = `
            insert 
            into 
            auth
            values (?,?,?)
        `
        const values = [auth_code,phone,expire]
        connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log(err)
                    res.render("auth2",{
                        st:_st,//
                        state:3,  
                        dir :2                      
                    })
                } else{
                    
                    console.log("인증번호 발행")
                
    
                    twilioClient.messages.create({
                        body: 'GolfPlatform 케이그라운드 인증번호 :   ' + auth_code,
                        from: process.env.kphonenumber,
                        to: gphone
                        })
                        .then(message => console.log("verify.ejs----", message.sid))
                            // 문자인증 코드를 MySQL에서 조회합니다.
                        res.render('auth2',{
                            phone : phone,
                            state:1,
                            st:_st,
                            dir :2  

                        })}
            }) 
})        



router.get('/auth1', async  (req, res) => {
    const _state=3
    const _dir=2//로그+결제 모두 변경
    const _st=0
    res.render("auth1",{
    
    state:_state,
    st:_st,
    dir:_dir
})})
    

// 비밀번호 찾기
router.post('/auth1', async  (req, res) => {
    let _st=0//전번입력받아진행
    if(req.session.logined){
            _st=1
    }
    const phone = await req.body.phone.trim()//로그인 안되어서 입력 받음 
    console.log("req.body._phonee =",phone )
    if (phone.length == 11) {
        const gphone = "+82"+ phone
        console.log("auth 실행 들어옴 gphone =",gphone)
        // 문자인증 코드를 생성합니다.
        // 랜덤으로 4자리 인증 코드를 만든다.
        const auth_code = Math.floor(Math.random() * 10000)
        console.log("auth 실행 들어옴 auth_code =",auth_code)
        const expire = new Date()
        console.log("auth 실행 들어옴 expire =",expire)
        console.log("process.env.kphonenumber=",process.env.kphonenumber)

        //db에 기록
        const sql = `
            insert 
            into 
            auth
            values (?,?,?)
        `
        const values = [auth_code,phone,expire]
        connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log(err)
                    res.render("auth1",{
                        st:_st,//
                        phone:phone,
                        state:3,  
                        dir:1                        
                    })
                } else{
                        
                        console.log("인증번호 발행")
                    
        
                        twilioClient.messages.create({
                            body: 'GolfPlatform 케이그라운드 인증번호 :   ' + auth_code,
                            from: process.env.kphonenumber,
                            to: gphone
                            })
                            .then(message => console.log("verify.ejs----", message.sid))
                                // 문자인증 코드를 MySQL에서 조회합니다.
                            res.render('auth1',{
                                phone : phone, 
                                state:1,
                                st:_st,
                                dir:1

                            })}
        })
//전화번호 길이가 맞지 안흥면 다시 입력
    }else{
        res.render("auth1",{
            phone : phone, 
            state:0,
            st:_st,
            dir:1
        })
    }
 } )        



    // 문자인증(폰번호 입력된 상태로 렌더린 당함)
    router.get('/auth', async  (req, res) => {
        const _dir= req.body.dir
        const _state = req.body.state
        let _st=0
        if(req.session.logined){
             _st=1
        }
        res.render("auth",{
            state:_state,
            st:_st,
            dir:_dir
        })

    })
    router.post('/auth', async  (req, res) => {
        const _dir= req.body.dir
        const _state = req.body.state
        let _st=0
        if(req.session.logined){
             _st=1
        }
            const phone = req.session.logined.phone
            console.log("req.session.logined.phone =",phone )

            const gphone = "+82"+ phone
            console.log("auth 실행 들어옴 gphone =",gphone)
            // 문자인증 코드를 생성합니다.
            // 랜덤으로 4자리 인증 코드를 만든다.
            const auth_code = Math.floor(Math.random() * 10000)
            console.log("auth 실행 들어옴 auth_code =",auth_code)
            const expire = new Date()
            console.log("auth 실행 들어옴 expire =",expire)
            console.log("process.env.kphonenumber=",process.env.kphonenumber)

            //db에 기록
            const sql = `
                insert 
                into 
                auth
                values (?,?,?)
            `
            const values = [auth_code,phone,expire]
            connection.query(
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                        res.render("auth",{
                            st:_st,
                            state:3                           
                        })
                    } else{
                            
                            console.log("인증번호 발행")
                        
            
                            twilioClient.messages.create({
                                body: 'GolfPlatform 케이그라운드 인증번호 :   ' + auth_code,
                                from: process.env.kphonenumber,
                                to: gphone
                                })
                                .then(message => console.log("verify.ejs----", message.sid))
                                    // 문자인증 코드를 MySQL에서 조회합니다.
                                res.render('auth',{
                                    phone : phone,
                                    state:1,
                                    st:_st,
                                    dir:0
                                    
                                })}
                })})


    router.get('/verify', (req, res)=>{
            // const direct = dir
            // res.render('auth',{
            //     dir:dir,
            //     phone : req.body._phone
            // })
        })

    // 문자인증을 확인합니다.
    router.post('/verify', async (req, res) => {

        const _dir=req.body.dir
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>_dir=", _dir)
        const code1 = await req.body.input_auth_code.trim()
        const code = parseInt(code1)
        const vphone =req.body.phone.trim()
        console.log('req=',code)
        if(req.session.login){
            vphone = req.session.logined.phone
        }

        console.log('req.session.phone=',vphone)
        
        //인증문자가 맞는지 비교한다

        //폰번호로 db에서 db에서 전번으로 인증번호를 찾고
        const sql = `
                select 
                * 
                from 
                auth 
                where 
                auth_code = ?
                `
        const values = [code]
        connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log("err")
                }else{
    
                    if (result.length === 0) {
                        console.log("User가 없습니다.")
                        return
                    }else{
                        const vphone=result[0].phone
                            //인증문자가 찾아지면
                        console.log('sql=',sql)
                        console.log(result[0])
                        //3분이 지났는지 확인
                        console.log('문자전송시간-',result[0].expire)
                        const now = new Date()
                        console.log('현재시간 : ',now)
                        expireTime =Math.floor((now.getTime()- result[0].expire.getTime())/ 1000)  ; 
                        console.log('expireTime=',expireTime)
        
                        console.log(`시간차 ${expireTime}`)
                        console.log(`auth_code ${result[0].auth_code}`)
                        // 인증코드와 유효시간 모두 검사한 결과를 비교해서
                        console.log('code === result[0].auth_code',code == result[0].auth_code,code,result[0].auth_code)
                        console.log('expire_time > now', expireTime < 180)
                        if (code == result[0].auth_code && expireTime > 180) {
                            console.log("인증시간이 지났습니다.")
                            res.render("auth",{
                                state:2
                            })
                        }else{ 
                            
                            console.log("인증성공, 로그+결제비밀번호 밖구기로 갈 것")
                            res.render("change_pass",{
                                phone :vphone,
                                state:1

                            })  }}
                                }})})

    
    router.post('/verify1', async (req, res) => {

        
        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>_dir=", _dir)
        const code1 = await req.body.input_auth_code.trim()
        const code = parseInt(code1)
        const vphone =req.body.phone 
        console.log('req=',code)
        if(req.session.login){
            vphone = req.session.logined.phone
        

        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>vphone=", vphone)
        }
        //인증문자가 맞는지 비교한다

        //폰번호로 db에서 db에서 전번으로 인증번호를 찾고
        const sql = `
                select 
                * 
                from 
                auth 
                where 
                auth_code = ?
                `
        const values = [code]
        connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log("err")
                }else{
    
                    if (result.length === 0) {
                        console.log("User가 없습니다.")
                        return
                    }else{
                        const phone=result[0].phone
                            //인증문자가 찾아지면
                        console.log('sql=',sql)
                        console.log(result[0])
                        //3분이 지났는지 확인
                        console.log('문자전송시간-',result[0].expire)
                        const now = new Date()
                        console.log('현재시간 : ',now)
                        expireTime =Math.floor((now.getTime()- result[0].expire.getTime())/ 1000)  ; 
                        console.log('expireTime=',expireTime)
        
                        console.log(`시간차 ${expireTime}`)
                        console.log(`auth_code ${result[0].auth_code}`)
                        // 인증코드와 유효시간 모두 검사한 결과를 비교해서
                        console.log('code === result[0].auth_code',code == result[0].auth_code,code,result[0].auth_code)
                        console.log('expire_time > now', expireTime < 180)
                        if (code == result[0].auth_code && expireTime > 180) {
                            console.log("인증시간이 지났습니다.")
                            res.render("auth1",{
                                
                                state:2
                            })
                        }else{ 
                            
                            console.log("인증성공, 로그+결제비밀번호 밖구기로 갈 것", phone)
                            
                            res.render("change_pass1",{
                                phone :phone,
                                state:2
                            })  }}
                                    }})})

    router.post('/verify2', async (req, res) => {

        const _dir=req.body.dir
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>_dir=", _dir)
        const code1 = await req.body.input_auth_code.trim()
        const code = parseInt(code1)
        const vphone =req.query.phone 
        console.log('req=',code)
        console.log('req.query.phone =',req.query.phone )

        if(req.session.login){
            vphone = req.session.logined.phone
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>vphone=", vphone)
        }
        
        //인증문자가 맞는지 비교한다

        //폰번호로 db에서 db에서 전번으로 인증번호를 찾고
        const sql = `
                select 
                * 
                from 
                auth 
                where 
                auth_code = ?
                `
        const values = [code]
        connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log("err")
                }else{
    
                    if (result.length === 0) {
                        console.log("User가 없습니다.")
                        return
                    }else{
                        const vphone=result[0].phone
                            //인증문자가 찾아지면
                        console.log('sql=',sql)
                        console.log(result[0])
                        //3분이 지났는지 확인
                        console.log('문자전송시간-',result[0].expire)
                        const now = new Date()
                        console.log('현재시간 : ',now)
                        expireTime =Math.floor((now.getTime()- result[0].expire.getTime())/ 1000)  ; 
                        console.log('expireTime=',expireTime)
        
                        console.log(`시간차 ${expireTime}`)
                        console.log(`auth_code ${result[0].auth_code}`)
                        // 인증코드와 유효시간 모두 검사한 결과를 비교해서
                        console.log('code === result[0].auth_code',code == result[0].auth_code,code,result[0].auth_code)
                        console.log('expire_time > now', expireTime < 180)
                        if (code == result[0].auth_code && expireTime > 180) {
                            console.log("인증시간이 지났습니다.")
                            res.render("auth2",{
                                state:2
                            })
                        }else{ 
                            
                            console.log("인증성공, 로그+결제비밀번호 밖구기로 갈 것")
                            res.render("change_pass2",{
                                phone :vphone,
                                state:0//

                            })  }}
}})})

router.post('/verify6', async (req, res) => {

    const _dir=req.body.dir 
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>_dir=", _dir)
    const code1 = await req.body.input_auth_code.trim()
    const code = parseInt(code1)
    const vphone = req.session.logined.phone
    console.log('req=',code)
    //인증문자가 맞는지 비교한다

    //폰번호로 db에서 db에서 전번으로 인증번호를 찾고
    const sql = `
            select 
            * 
            from 
            auth 
            where 
            auth_code = ?
            `
    const values = [code]
    connection.query(
        sql, 
        values, 
        function(err, result){
            if(err){
                console.log("err")
            }else{

                if (result.length === 0) {
                    console.log("User가 없습니다.")
                    return
                }else{
                    
                    //인증문자가 찾아지면
                    console.log('sql=',sql)
                    console.log(result[0])
                    //3분이 지났는지 확인
                    console.log('문자전송시간-',result[0].expire)
                    const now = new Date()
                    console.log('현재시간 : ',now)
                    expireTime =Math.floor((now.getTime()- result[0].expire.getTime())/ 1000)  ; 
                    console.log('expireTime=',expireTime)
    
                    console.log(`시간차 ${expireTime}`)
                    console.log(`auth_code ${result[0].auth_code}`)
                    // 인증코드와 유효시간 모두 검사한 결과를 비교해서
                    console.log('code === result[0].auth_code',code == result[0].auth_code,code,result[0].auth_code)
                    console.log('expire_time > now', expireTime < 180)
                    if (code == result[0].auth_code && expireTime > 180) {
                        console.log("인증시간이 지났습니다.")
                        res.render("auth6",{
                            phone : result[0].phone,
                            state:2
                        })
                    }else{ 
                        
                        console.log("인증성공, 로그+결제비밀번호 밖구기로 갈 것")
                        res.render("change_paypass6",{
                            phone :vphone,
                            state:1
                        })  }}
}})})



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

        const _nickname =   req.body.input_nickname
        const _refferal =   req.body.input_refferal

        const _amount =  parseInt(req.body.input_amount)
        const _tier =   req.body.input_tier
        const _memo =   req.body.input_memo
        const _phone =   req.body.input_phone
        const _username =  req.body.input_username
        
        
        const _memotime = moment().format('YYYY-MM-DDTHH:mm:ss')

        kpoint.log_info_update( _nickname,_refferal,  _amount,  _tier, _phone)
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
                res.render("db_update",{
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

        const _nickname =   req.body.input_nickname
        const _refferal =   req.body.input_refferal

        const _amount =  parseInt(req.body.input_amount)
        const _tier =   req.body.input_tier
        const _memo =   req.body.input_memo
        const _phone =   req.body.input_phone
        const _username =  req.body.input_username
        
        
        const _memotime = moment().format('YYYY-MM-DDTHH:mm:ss')

        kpoint.log_info_update( _nickname,_refferal,  _amount,  _tier, _phone)
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
            console.log("admin_score ok's 렌더링해주는 result2=", result2)
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
router.get('/papago_list', async (req, res)=>{
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

                        //console.log("papago= ",res, resuser, resnick, papago  )
                        
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

                                                    console.log("papago insert= ",resuser )
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
                        res.render('papago_list', {
                            resultt:result4,
                            username :  req.session.logined.username,
                            
                            })}
            })}})}})

router.get('/trophy', function(req, res){
    console.log("상금관련 페이지 보여주기")
    res.render("trophy")
})


// return이 되는 변수는 router
    return router
}



