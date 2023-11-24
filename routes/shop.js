const express = require('express')
const router = express.Router()
// express를 사용하기 위하여 express 모듈을 로드 

const fs = require('fs')
// route부분이기 때문에 express.Router()

const moment = require('moment')
const http = require('http');

// mysql의 정보를 등록
const mysql = require('mysql2')
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

module.exports = function(){


router.get('/shop', function(req, res){
    if(!req.session.logined){
        console.log(req.session.logined)
        res.redirect("/")

    }else{
        const phone=req.session.logined.phone
         
        // 기 등록한 데이터 입력 받지 않고 db에서 획득  
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
                    res.render("shop",{
                        phone:phone,
                        username:req.session.logined.username,
                        amount:req.session.logined.charge_amount
                })}
})}})


router.get('/giga_1', async (req, res)=>{
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
                    const _product_name  = "giga_001"
                    
                    console.log("_product_name  =", _product_name   )

                    const sql6 =
                        `
                        select 
                        *
                        from 
                        giga
                        where 
                        name = ?
                        
                            `
                    const values6 = [_product_name]
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
                            //주문시간
                            //주문한사람정보
                            res.render('shopdetail', {
                                amount : balance ,
                                phone : phone,
                                card:card,
                                filename:filename,
                                filename_detail:filename_detail,
                                username :result7[0].username,
                                productname: _product_name,
                                price:price,
                                kpoint:kpoint
                             
                    })}})
    }})}})

    router.get('/pay', async (req, res)=>{
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
                        const filename= req.body.input_filename
                        
                        console.log("filename  =", filename   )
    
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
                                const price=result6[0].hap
                                const kpoint =result6[0].kpoint
                                const card = result6[0].card
                                 
                                const juso=req.body.input_post//주문한 사람의 주소
                                //주문시간
                                //주문한사람정보
                                res.render('pay', {
                                    amount : balance ,
                                    phone : phone,
                                    card : card,
                                    filename:filename,
                                    filename_detail:filename_detail,
                                    username :result7[0].username,
                                    productname: _product_name,
                                    price:price,
                                    kpoint:kpoint
                                 
                        })}})
        }})}})


    router.post('/pay', async (req, res)=>{
        if(!req.session.logined){
            let data=0
            res.render('login', {
                'state' : data
            })
        }else{
            const input_post = await req.body.input_post.trim()
            const input_paymethod =  await  req.body.input_paymethod.trim()
            const input_username  =  req.body.input_username
            const phone  =  req.body.input_phone
            const input_card =req.body.input_card
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
 
                    
                    const input_product_name  =  req.body.input_product_name
                    

                    const sql6 =
                        `
                        select 
                        *
                        from 
                        giga
                        where 
                        name = ?
                        
                            `
                    const values6 = [input_product_name]
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
                                                       
                            const input_dt = moment().format('YYYY-MM-DDTHH:mm:ss')
                            const sql7 =
                                `
                                insert 
                                into 
                                giga_pay
                                values (?,?,?,?,?,?,?,?)
                                `
                            const values7 = [input_dt,filename,price,card,kpoint,bank,input_post,input_paymethod]
                            connection.query(
                            sql7, 
                            values7, 
                            function(err, result7){
                                if(err){
                                    console.log(err)
                                }else{

                                    res.render('pay', {

                                        post:input_post,
                                        paymethod:input_paymethod,
                                        phone: phone,
                                        card:card,
                                        bank:bank ,
                                        filename:filename,
                                        filename_detail:filename_detail,
                                        username :input_username,
                                        productname: input_product_name,
                                        price:price,
                                        kpoint:kpoint,
                                        amount:amount
                                    
                            })}})
    }})}})}})

router.get('/onlyholein', function(req, res){
    res.render("onlyholein")
})

// return이 되는 변수는 router
    return router
}