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

        //user_info의 통계
        const sql2 = `
            select 
            * 
            from 
            user_info 
            `
        connection.query(
            sql2, 
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                const tot_count = result2.length
                const tot_charge=''
                let tot_char = 0
                for(var i=0;i<tot_count; ++i){
                    tot_char = tot_char+result2[i].charge_amount
                }
                tot_charge = tot_char.toString()
                

                res.render('admin_index.ejs', {
                    'login_data': req.session.logined ,
                    total_count:tot_count,
                    total_charge:tot_charge
                })
            }
        })
    
        //user_info의 통계
        const sql3 = `
            select 
            * 
            from 
            user_info 
            `
        connection.query(
            sql2, 
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                const tot_count = result2.length
                const tot_charge=''
                let tot_char = 0
                for(var i=0;i<tot_count; ++i){
                    tot_char = tot_char+result2[i].charge_amount
                }
                tot_charge = tot_char.toString()

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
                const tot_charge_charge=''
                let tot_char = 0
                for(var i=0;i<tot_charge_count; ++i){
                    tot_char = tot_char+result3[i].transamount
                }
                tot_charge_charge = tot_char.toString()

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
                 const tot_deposit=''
                 let tot_char = 0
                 for(var i=0;i<tot_deposit_count; ++i){
                     tot_char = tot_char+result3[i].transamount
                 }
                 tot_deposit = tot_char.toString()

                res.render('admin_index.ejs', {
                    'login_data': req.session.logined ,
                    total_count:tot_count,
                    total_charge:tot_charge,
                    total_charge_count:tot_charge_count,
                    total_charge_charge:tot_charge_charge,
                    total_deposit:tot_deposit
                })
            }})
        }})
    }})
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

        const user_phone = await req.body.phone
        const user_name = await req.body.username
        //user_info의 통계
        const sql2 = `
            select 
            * 
            from 
            user_info 
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
                kpoint.log_info_update()
                res.render('db_update.ejs', {
                    'login_data': req.session.logined ,
                    resultt:result2
                })
            }})


}})








return router

}