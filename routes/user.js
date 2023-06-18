const express = require('express')
const router = express.Router()
const moment = require('moment')

// mysql의 정보를 등록
const mysql = require('mysql2')

// mysql server 정보를 입력
const connection = mysql.createConnection({
    host : process.env.host, 
    port : process.env.port, 
    user : process.env.user, 
    password : process.env.password,
    database : process.env.db 
})

// token.js 파일 로드 
const token = require("../token/token")


    // user.js 파일은 localhost:3000/user 로 요청시에만 사용
    // 이 파일의 기본 경로는 localhost:3000/user
module.exports = function(){

    // localhost:3000/user/login 요청 시
    router.get('/login', function(req, res){
        // session 정보가 존재하지 않는다면 login 화면을 보여주고
        // session 정보가 존재한다면 localhost:3000/survey 주소로 이동
        if(!req.session.logined){
            res.render('login')
        }else{
            res.redirect('index')
        }
    })

    // localhost:3000/user/login [post] 형식으로 요청 시
    router.post("/login", function(req, res){
        // 로그인 화면에서 유저가 입력 id, pass값을 변수에 대입
        const _phone = req.body.input_phone
        const _pass = req.body.input_pass
        console.log(_phone, _pass)

        // DB에 있는 table에 id와 password가 유저가 입력한 데이터와
        // 같은 데이터가 존재하는가 확인
        // 쿼리문을 이용하여 데이터의 존재 유무를 확인
        connection.query(
            `
                select 
                * 
                from 
                log_info 
                where 
                phone = ? 
                and 
                pass = ?
            `, 
            [_phone, _pass], 
            function(err, result){
                if(err){
                    console.log('login select error')
                    res.send(err)
                }else{
                    console.log(result)
                    // 로그인이 성공하는 조건?
                    // 데이터가 존재하면 로그인 성공
                    // 데이터가 존재하지 않는다면 로그인이 실패
                    // sql 에서 데이터를 받을때 [{id : xxx, password:xxx}]
                    if(result.length != 0){
                        // 로그인이 성공하는 조건
                        req.session.logined = result[0]
                    }
                    res.redirect("/?data=fail")
                }
            }
        )
    })


    // 회원 가입 (localhost:3000/user/signup주소로 요청시)
    router.get('/signup', function(req, res){
        res.render('signup')
    })

    router.post('/signup', async function(req, res){
        // 유저가 보낸 데이터를 서버에서 대소로 대입
        const _phone = req.body.input_phone
        const _pass = req.body.input_pass
        const _username = req.body.input_username
        const _nickname = req.body.input_nickname
        const _refferal = req.body.input_refferal
        const _numeric6= req.body.input_numeric6
    
        console.log(_phone, _pass, _username, _nickname, _refferal, _numeric6  )

        // 지갑을 생성 
        const _wallet = await token.create_wallet()

        // 유저가 보내온 데이터를 가지고 sql user_info table에 데이터를 삽입
        connection.query(
            `insert into 
            log_info 
            values (?, ?, ?, ?, ?, ?, ?)`, 
            [_phone, _pass, _username, _nickname, _refferal, _numeric6, _wallet], 

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


    // 회원 탈퇴 하는 주소를 생성
    router.get("/drop_user", function(req, res){
        // 본인 확인 페이지를 로드 
        res.render('drop_user', {
            '_phone' : req.session.login.phone
        })
    }) 

   
    // 회원 탈퇴 sql api
    router.post('/drop_use', function(req, res){
        // 유저가 입력한 데이터를 변수에 대입
        const _phone = req.body.input_phone
        const _pass = req.body.input_pass
        console.log(_phone, _pass)

        // 해당하는 변수들을 이용하여 데이터베이스에서 확인
        connection.query(
            `select * from log_info where phone = ? and pass = ?`, 
            [_phone, _pass], 
            function(err, result){
                if(err){
                    console.log(err)
                    res.send('drop select sql error ')
                }else{
                    if(result.length != 0){
                        connection.query(
                            `delete from log_info where phone = ?`, 
                            [_phone], 
                            function(err2, result2){
                                if(err2){
                                    console.log(err2)
                                    res.send('drop delete error')
                                }else{
                                    // session data를 삭제
                                    req.session.destroy(function(){
                                        req.session
                                    })
                                    res.redirect('/')
                                }
                            })
                        }
                }
            }
        )}
    )
    
    router.get('/check_id', function(req, res){
        // 유저가 보낸 데이터를 변수에 대입
        const phone = req.query._phone
        console.log(phone)
        sql = `
            select * from log_info where phone = ?
        `
        values = [phone]
        // DB 정보는 connection 변수에 대입 
        connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log(err)
                }else{
                    // id를 체크하는 부분에서 select의 결과가 []이면 사용 가능한 아이디
                    if(result.length == 0){
                        res.send(true)
                    }else{
                        res.send(false)
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

    router.get('/index', async function(req, res){
        if(!req.session.logined){
            res.redirect("/")
        }else{
            // 유저의 정보는 -> req.session.logined
            // 토큰의 수량은? -> token.js -> balanceOf(지갑 주소)
            const wallet = req.session.logined.wallet
            const amount = await token.balance_of(wallet)
            console.log(amount)
            res.render('index', {
                'user': req.session.logined, 
                'amount' : amount
            })
        }
    
    })

// return이 되는 변수는 router
    return router
}