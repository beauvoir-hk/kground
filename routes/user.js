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
                 
    

    //localhost:3000/login [post] 형식으로 요청 시
    router.post("/login", async (req, res)=>{
        // 로그인 화면에서 유저가 입력 id, pass값을 변수에 대입
        const _phone = await req.body.input_phone
        const _pass = await req.body.input_pass
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

                        
                        //비밀번호 1234일때 문자인증후 비밀번호 + 선수등록  필수
                        if(result[0].pass == "1234"){
                            res.render("auth",{
                                phone:logphone,
                                state:3, //문자인증 비밀번호 변경에 대한안내
                                st:1 ,//로그린 상태는 전번고정
                                dir:0//비밀번호 변경 화면 선택 (1,두개다변경,2 로그인, 3결제)
                            })
                        }else{
                            //KSFC등록 유뮤확인하여 안했으면 등록하러가기
                            const sql2 = `
                                select 
                                * 
                                from 
                                ksfc 
                                where 
                                phone = ?
                                    `
                            const values2 = [logphone]

                            connection.query(
                                sql2, 
                                values2, 
                                function(err, result2){
                                    if(err){
                                        console.log(err)
                                        res.send(err)
                                    }else{
                                        if(result2.length==0){
                                            //KSFC등록이 없으니 등록하러 가기(( 5번 스테이트)
                                            res.render("ksfc",{
                                                phone:req.session.logined.phone,
                                                amount:req.session.logined.charge_amount,
                                                state:5
                                            })
                                        }else{
                                            //로그인도 되고 KSFC등록이 되었으니 인덱스로
                                            res.redirect('/index')
                                        }
                                    }})
                                }
                    }else
                        res.redirect('/?data=false')
                    }})
                } )


    // 회원 가입 (localhost:3000/user/signup주소로 요청시)
    router.get('/signup', (req, res)=>{
        res.render('signup.ejs')
    })

    router.post('/signup', async (req, res)=>{

        // 유저가 보낸 데이터를 서버에서 대소로 대입
        const _phone = req.body.input_phone
        const _pass = req.body.input_pass
        const _username = req.body.input_username
        const _nickname = req.body.input_nickname
        const _refferal = req.body.input_refferal
        const _numeric6= req.body.input_numeric6
        // const date = moment()
        // const input_dt= date.format('YYYY-MM-DD HH:mm:ss')
        const input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')
        console.log(_phone, _pass, _username, _nickname, _refferal, _numeric6 , input_dt )

        const tier = "1"
        const _amount = 0
        // 유저가 보내온 데이터를 가지고 sql user_info table에 데이터를 삽입

            const sql = `
                    insert 
                    into 
                    log_info 
                    values ( ?, ?, ?, ?, ?, ?, ?,?,?)
                    `
            const values =
                [_phone, _pass, _username, 
                    _nickname, _refferal, _numeric6, _amount,tier,input_dt] 

                connection.query(
                    sql,
                    values,
                    (err, result)=>{
                        if(err){   
                            console.log(err)}
                            else{
                                if (result.length == 0) {
                                    console.log("가입내역 기록 하나도 없다네")
                                } else {
                                    console.log("회원가입기록= ",result.lengthh)
                                }
                }}) 
            })


    router.get('/index', async function(req, res){
        if(!req.session.logined){
            console.log('로그인정보가 없음')
            res.redirect("/")
        }else{
            console.log('로그인 되었어요')
            res.render('index.ejs', {
                'login_data': req.session.logined, 
            })
        }
    
    })

   
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


router.post('/change_pass_all', async function(req, res){
    const input_new_pass = await req.body.input_pass
    const input_new_pass6 = await req.body.input_paypass6
    const phone=req.body.phone
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
    const values = [input_new_pass,input_new_pass6,  phone]
    connection.query(
        sql, 
        values, 
        function(err, result){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                console.log('loginfo sql',input_new_pass, phone)
                console.log("로그인비밀번호 변경성공", result)
                res.render("ksfc",{
                    phone:phone,

                    state:0//이거매우중요(로그인 없이 가기 때문에 여기 전번을 가지고 대회참가등록해야함)
                })
            } } )
        })


router.post('/change_pass1', async function(req, res){
    const input_new_pass = await req.body.input_pass
    const phone=req.body.phone
    console.log(input_new_pass)
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
                console.log('loginfo sql',input_new_pass, phone)
                console.log("로그인비밀번호 변경성공", result)
                res.render("change_pass1",{
                    phone:phone,
                    state:0
                })
            } } )
        })

router.post('/change_pass', async function(req, res){
    const input_new_pass = await req.body.input_pass
    const phone=req.body.phone
    console.log(input_new_pass)
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
                console.log('loginfo sql',input_new_pass, phone)
                console.log("로그인비밀번호 변경성공", result)
                res.render("change_pass",{
                    phone:phone,
                    state:0
            }) }} )
        })

router.post('/change_paypass6', async function(req, res){
    const phone=req.body.phone
    const input_new_pass6 = await req.body.input_paypass6
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
                console.log('loginfo sql',input_new_pass6, phone)
                    console.log("결제비밀번호 변경성공", result)
                    res.render("change_pass6",{
                        phone:phone,
                        state:0
            })}}
)})
                        

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
            res.render("auth6",{
                phone:req.session.logined.phone,
                state:_state,
                st:_st,
                dir:_dir
    })}})
        

    // 비밀번호 찾기
    router.post('/auth6', async  (req, res) => {
        let _st=0//전번입력받아진행
        const _dir= await req.body.dir
        if(req.session.logined){
             _st=1
        }
        const phone = req.session.logined.phone
        console.log("req.body._phonee =",phone )

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
                            
                            console.log("문자인증번호기록= ",result.length)

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
        if(req.session.logined){
            res.render("auth2",{
                phone:req.session.logined.phone,
                state:_state,
                st:_st,
                dir:_dir
    })}})
        

    // 비밀번호 찾기
    router.post('/auth2', async  (req, res) => {
        let _st=0//전번입력받아진행
        if(req.session.logined){
             _st=1//기로그인
        }
        const phone = req.session.logined.phone
        console.log("req.body._phonee =",phone )

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
            })})

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
                const phone = await req.body._phone//로그인 안되어서 입력 받음 
                console.log("req.body._phonee =",phone )
        
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
                    })})        

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
        const code1 = await req.body.input_auth_code
        const code = parseInt(code1)
        const vphone =req.body._phone 
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

        const _dir=req.body.dir
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>_dir=", _dir)
        const code1 = await req.body.input_auth_code
        const code = parseInt(code1)
        const vphone =await req.body._phone 
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
                            
                            console.log("인증성공, 로그+결제비밀번호 밖구기로 갈 것")
                            
                            res.render("change_pass1",{
                                _phone :phone,
                                state:1
                            })  }}
                                    }})})

    router.post('/verify2', async (req, res) => {

        const _dir=req.body.dir
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>_dir=", _dir)
        const code1 = await req.body.input_auth_code
        const code = parseInt(code1)
        const vphone =req.body._phone 
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
    const code1 = await req.body.input_auth_code
    const code = parseInt(code1)
    const vphone =req.body._phone 
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
                        res.render("auth6",{
                            state:2
                        })
                    }else{ 
                        
                        console.log("인증성공, 로그+결제비밀번호 밖구기로 갈 것")
                        res.render("change_pass6",{
                            phone :vphone,
                            state:1
                        })  }}
}})})


// return이 되는 변수는 router
    return router
}



