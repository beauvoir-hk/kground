//express, router를 가지고 온다
const express = require('express')
const router = express.Router()
//현재의 시간을 알려주는 모듈모드
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
    //해당 파일에서 기본 url : localhost:3000/ 

    //router api생성
    //localhost:3000/요청시 
    router.get("/", (req, res)=>{
        if(!req.session.logined){
            
            res.redirect('/')
            // res.redirect('/?data=false')
        }else{
            res.redirect('/index')
        }
    
    })

    //localhost:3000/login [post] 형식으로 요청 시
    router.post("/login", (req, res)=>{
        // 로그인 화면에서 유저가 입력 id, pass값을 변수에 대입
        const _phone = req.body.input_phone
        const _pass = req.body.input_pass
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
                        res.redirect("index")
                        }else{
                            console.log('로그인정보 오류result[0]=', result[0])
                            res.redirect('/?data=false')
                        }
                    // res.redirect("/")
                    }
                }
        )
    })


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
        const date = moment()
        const input_dt=date.format("YYYY-MM-DD : hh-mm-ss")
        console.log(_phone, _pass, _username, _nickname, _refferal, _numeric6 , input_dt )

        // 지갑을 생성 
        const _wallet = await token.create_wallet()

        // 유저가 보내온 데이터를 가지고 sql user_info table에 데이터를 삽입
        connection.query(
            `
            insert 
            into 
            log_info 
            values ( ?, ?, ?, ?, ?, ?, ?,?)`, 
            [_phone, _pass, _username, _nickname, _refferal, _numeric6, _wallet, input_dt], 

            function(err, receipt){
                if(err){
                    console.log(err)
                    res.send('user signup sql error')
                }else{
                    console.log(receipt)
                    // sql 쿼리문이 정상적으로 작동하면 로그인 화연으로 돌아간다. 
                    res.redirect("/")
                }
            }
        )
    })

    router.get('/index', async function(req, res){
        if(!req.session.logined){
            console.log('로그인정보가 없음')
            res.redirect("/")
        }else{
            // 유저의 정보는 -> req.session.logined
            // 토큰의 수량은? -> token.js -> balanceOf(지갑 주소)
            const wallet = req.session.logined.wallet
            console.log('로그인 되었어요')
            console.log(wallet)
            const amount = await token.balance_of(wallet)
            console.log(amount)
            // 해당하는 부분에서 에러가 발생합니다. 
            res.render('index.ejs', {
                'login_data': req.session.logined, 
                'amount' : amount
            })
        }
    
    })
    // // 회원 탈퇴 하는 주소를 생성
    // router.get("/drop2", function(req, res){
    //     // 본인 확인 페이지를 로드 
    //     res.render('drop2', {
    //         '_phone' : req.session.login.phone
    //     })
    // }) 

   
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

    router.get('/regist', function(req, res){

        if(!req.session.logined){
            console.log(req.session.logined)
            res.redirect("/")
        }else{
            res.render('regist.ejs',{
                login_data : req.session.logined
            })
        }
    })

    // localhost:3000/golf/regist [get]
    router.post('/regist', async  function(req, res){
        // 유저가 입력한 데이터를 변수에 대입 
        const _gamenumber = req.body.input_gamenumber
        const _gender = req.body.input_gender
        const _jiyeok = req.body.input_jiyeok
        const _birth = req.body.input_birth
        const _golfsys = req.body.input_golfsys
        console.log(_gamenumber, _gender, _jiyeok, _birth ,_golfsys)

        // name 값은 로그인 데이터에서 name 값을 가지고 온다
        // 로그인 정보는 session 저장
        // name 값을 가지고 오려면 session 안에 있는 name을 추출
        const _phone = await req.session.logined.phone
        console.log(_phone)
        const _username= await req.session.logined.username
        console.log(_username)
        // // session 안에 있는 로그인 한 사람의 지갑 주소를 
        // 추출
        // const addr = req.session.login.wallet
        // console.log(addr)
        // 유저가 보내온 데이터를 가지고 sql user_info table에 데이터를 삽입
        // DB 안에 있는 goods table의 정보를 불러온다. 
        const sql = `
        insert 
        into 
        sga
        values (?, ?, ?, ?, ?, ?,?)
        ` 
        const values = [
        _phone, 
        _username,
        _gamenumber, 
        _gender, 
        _jiyeok, 
        _birth ,
        _golfsys 
        ]
        
        connection.query(
            sql, 
            values,
            function(err, result){
                if(err){
                    console.log(err)
                    res.send(err)
                }else{
                    console.log(result)     
                    // sql 쿼리문이 정상적으로 작동하면 메인 화연으로 돌아간다. 
                    res.redirect("/index")
                }
            })
    })

    
    router.get('/check_pass', function(req, res){
        // 유저가 보낸 데이터를 변수에 대입
        const input_pass = req.query._pass
        console.log(input_pass)
        res.send(input_pass == req.session.logined.pass)
    })

    router.get('/check_id', function(req, res){
        const input_id = req.query._id
    
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
                    if(result.length != 0){
                        res.send(false)
                    }else{
                        res.send(true)
                    }
                }
            }
        )
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
            const balance = await token.balance_of(req.session.logined.wallet)
            res.render('my.ejs', {
                login_data : req.session.logined, 
                amount : balance
            })
        }
    })

    router.post('/change_pass', function(req, res){
        const input_new_pass = req.body._pass
        console.log(input_pass)
        const phone = req.body.logined.phone

        const sql = `
        update
        log_info
        set
        password = ?
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
                    console.log(result)
                    req.session.logined.password = input_new_pass
                    console.log(req.session.logined.password)
                    res.redirect('/')
            }
        }
    )
})


// return이 되는 변수는 router
    return router
}