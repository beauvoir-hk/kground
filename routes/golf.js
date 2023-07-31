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

    router.get('/ksfc', async  function(req, res){
        if(!req.session.logined){
            let data=0
            res.render('login', {
                'state' : data
            })
        }else{
            console.log("ksfc")
            _phone=req.session.logined.phone
            connection.query(
                `select
                *
                from
                ksfc
                where 
                phone = ?
                `, 
                [ _phone ], 
                function(err, receipt){
                    if(err){
                        console.log(err)
                        res.send('errorpage.ejs')
                    }else{
                            console.log(receipt)
                            res.render("regist",{
                                login_data:req.session.logined
                            })
        }})}})


    // localhost:3000/golf/regist [get]
    router.post('/ksfc', async  function(req, res){
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
                        res.render("regist",
                        {
                          login_data:req.session.logined  
                        })
                        )
                    }
                }   
        )
    })

    //Kpoint list 출력
    router.get('stroke_lank', async (req, res)=>{
        const user = req.session.logined.username
        const phone = req.session.logined.phone 
        if(!req.session.logined){
            res.redirect("/")
        }else{    

            //phone번호로 로그인된 세션의 score만 읽어온다
            const sql = `
            select DISTINCT
            golfsys
            from 
            ksfc
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
                        state=false
                    }else{
                        state=true
                        let len =0
                        if(result.length>=5){
                            len =5
                            }else{
                                len=result.length
                            }
                            
                        //골프시스템별 bestscore구하기
                        const sql2 = `
                            select 
                            *
                            from 
                            ksfc
                            ORDER BY bestscore ASC
                            `
                            const values2 = [ phone]
                            connection.query(
                                sql2, 
                                values2, 
                                function(err, result2){
                                    if(err){
                                        console.log(err)
                                    }else{
                                    console.log("골프시스템 =",result)
                                    const etc=result2.length
                                    res.render('stroke_lank', {
                                        'resultt': result,
                                        'resultt2': result2,
                                        'username' : user, 
                                        'phone': phone,
                                        'len': len,
                                        'state':state
                                        })  
                             }})
                        
                    }
                })}})     
                        


router.get('/notice', function(req, res){
    res.render("notice")
})

router.get('/regu', function(req, res){
    res.render("regu")
})

// return이 되는 변수는 router
    return router
}