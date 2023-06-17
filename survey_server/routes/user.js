const express = require('express')
const router = express.Router()
const moment = require('moment')

// mysql을 사용하기 위해 mysql2 라이브러리 로드 
const mysql = require('mysql2')

// mysql server 정보를 입력
const connection = mysql.createConnection({
        host : process.env.host, 
        port : process.env.port, 
        user : process.env.user, 
        password : process.env.password, 
        database : process.env.db
    })

// token.js 로드 
const token = require("../token/token")

// user.js는 localhost:3000/일때 실행되는 js

module.exports = function(){
    
    router.get('/', function(req, res){
        // session 정보가 존재하지 않는다면 login 화면을 보여주고
        // session 정보가 존재한다면 localhost:3000/survey 주소로 이동
        if(!req.session.logined){
            res.render('index')
        }else{
            res.redirect('/survey')
        }
    })

    router.post('/login', function(req, res){
        // 유저가 입력한 데이터를 변수 대입
        const input_id = req.body._id
        const input_pass = req.body._pass
        console.log(input_id, input_pass)
        // 해당하는 id pass의 값을 가진 데이터가 존재하는가? 
        sql = `
            select * from user where id =? and pass = ?
        `
        values = [input_id, input_pass]
        connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log(err)
                    res.send(err)
                }else{
                    // 데이터가 존재하면? 로그인 성공
                    if(result.length != 0){
                        // 로그인이 성공한 경우 session 로그인 정보 대입
                        req.session.logined = result[0]
                    }
                    res.redirect("/")
                }
            }
        )
    })

    router.get('/signup', function(req, res){
        res.render('signup')
    })

    router.post('/signup', async function(req, res){
        // 유저가 보낸 데이터를 변수에 대입 
        const input_id = req.body._id
        const input_pass = req.body._pass
        const input_name = req.body._name
        console.log(input_id, input_pass, input_name)
        const signup_time = moment().format('YYYY-MM-DD HH:mm:ss')
        const wallet = await token.create_wallet()
        console.log(signup_time, wallet)
        // 해당하는 변수들을 DB 에 삽입
        sql = `
            insert into user values (?, ?, ?, ?, ?)
        `
        values = [input_id, input_pass, input_name, signup_time, wallet]
        connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log(err)
                    res.send(err)
                }else{
                    console.log(result)
                    res.redirect("/")
                }
            }
        )
    })

    router.get('/check_id', function(req, res){
        // 유저가 보낸 데이터를 변수에 대입
        const input_id = req.query._id
        console.log(input_id)
        sql = `
            select * from user where id = ?
        `
        values = [input_id]
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

    return router
}