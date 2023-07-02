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

    router.post('/check_sga', function(req, res){
        const _phone = req.session.logined.phone
        connection.query(
            `select
            *
            from
            sga
            where 
            phone = ?`, 
            [ _phone ], 
            function(err, result){
                if(err){
                    console.log(err)
                }else{
                    if(result.length == 0){
                        console.log(result.length)
                        res.send(false)
                    }else{
                        res.send(true)
                    }
                }
            })

    })

        // // smartcontract에 있는 method를 사용
        // smartcontract
        // .methods
        // .regist_golf(_gender, _jiyeok, _username,  addr)
        // .send(
        //     {
        //         from : account.address, 
        //         gas :  2000000
        //     }
        // )
        // .then(function(receipt){
        //     console.log(receipt)
        //     res.redirect('/main')
        // })
  

    // // localhost:3000/golf/add_hist [get]
    // router.get('/add_hist', function(req, res){
    //     // 유저가 입력한 데이터를 변수에 대입 
    //     const _gender = req.query.input_gender
    //     const _jiyeok = req.query.input_jiyeok
    //     const _birth = req.query.input_birth
    //     const _golfsys = req.query.input_golfsys
    //     console.log(_gender, _jiyeok, _birth ,_golfsys)

    //     // smartcontract 안에 있는 method를 이용하여 내역을 추가 
    //     smartcontract
    //     .methods
    //     .add_hist(_gender, _jiyeok, _birth ,_golfsys)
    //     .send(
    //         {
    //             from : account.address, 
    //             gas : 2000000
    //         }
    //     )
    //     .then(function(receipt){
    //         console.log(receipt)
    //         res.redirect("/main")
    //     })
    // })

    // localhost:3000/golf/view_golf [get]
    // router.get('/view_golf', function(req, res){
    //     // 유저가 입력한 데이터를 변수 대입
    //     const _phone = req.query.input_phone
    //     console.log(_phone)

    //     // smartcontract에 있는 method 중에 view 함수 호출
    //     smartcontract
    //     .methods
    //     .view_golf(_phone)
    //     .call()
    //     .then(function(result){
    //         console.log(result)
    //         // res.send(result)
    //         res.render('golf_hist', {
    //             'name' : result['0'], 
    //             'type' : result['1'], 
    //             'hist' : result['2'], 
    //             'wallet' : result['3'], 
    //             'price' : result['4'] , 
    //             'state' : result['5'], 
    //             'phone' : _phone
    //         })
    //     })
    // })

    router.get("/add_price", function(req, res){
        // 유저가 입력한 데이터 2개를 변수에 대입
        const _code = req.query.input_phone
        const _price = req.query.input_price
        console.log(_phone, _price)

        // 해당하는 값을 smartcontract에 있는 method 호출
        smartcontract
        .methods
        .regist_price(_phone, _price)
        .send({
            from : account.address, 
            gas : 2000000
        })
        .then(function(receipt){
            console.log(receipt)
            res.redirect("/")
        })
    })

    router.get('/trade/:code', async function(req, res){
        // 프론트 화면에서 보낸 데이터를 변수에 대입
        const _phone = req.params.phone
        let price
        let wallet
        // code값을 기준으로 view function 호출
        await smartcontract
        .methods
        .view_golf(_phone)
        .call()
        .then(function(result){
            price = result['4']
            wallet = result['3']
        })

        const receipt = await token.trade_token(wallet, price)
        console.log(receipt)

        // state를 변경하는 함수 호출
        await smartcontract
        .methods
        .change_state(_phone)
        .send({
            from : account.address, 
            gas : 2000000
        })
        .then(function(receipt2){
            console.log(receipt2)
            res.redirect("/")
        })


    })

    return router
}