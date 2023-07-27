const express = require('express')
const router = express.Router()

// mysql의 정보를 등록
const mysql = require('mysql2')
const connection = mysql.createConnection({
    host : process.env.host, 
    port : process.env.port, 
    user : process.env.user, 
    password : process.env.password,
    database : process.env.database
})


module.exports = function(){

    // localhost:3000/golf/regist [get]
    router.post('/rank', async  function(req, res){
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
        const _username= await req.session.logined.username
        console.log(_username)
        console.log(_phone)

        connection.query(
            `select
            *
            from
            sga
            where 
            phone = ?`, 
            [ _phone ], 
            function(err, receipt){
                if(err){
                    console.log(err)
                    res.send('errorpage.ejs')
                }else{
                        console.log(receipt)
                        // // session 안에 있는 로그인 한 사람의 지갑 주소를 
                        // 추출
                        // const addr = req.session.login.wallet
                        // console.log(addr)
                        // 유저가 보내온 데이터를 가지고 sql user_info table에 데이터를 삽입
                        connection.query(
                        `insert 
                        into 
                        sga
                        values (?, ?,?, ?, ?, ?, ?)`, 
                        [ _phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ], 
                                // sql 쿼리문이 정상적으로 작동하면 로그인 화연으로 돌아간다. 
                        res.redirect("/")
                        )
                    }
                }   
        )
    })



// return이 되는 변수는 router
    return router
}