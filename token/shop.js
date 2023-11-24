// express를 사용하기 위하여 express 모듈을 로드 
const express = require('express')
const res = require('express').response
var req = require('request') 
const fs = require('fs')
// route부분이기 때문에 express.Router()
const router = express.Router()
const moment = require('moment')
require('dotenv').config()

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
const http = require('http');

async function log_info_insert_memo(_phone,_username, _memo, _memotime, memo_admin){
    const sql = `
    insert 
    into 
    admin_memo
    values (?,?,?,?,?)
    `
const values = [_phone,_username, _memo,  _memotime, memo_admin]

connection.query(
    sql,
    values,
    (err, result)=>{
        if(err){   
            console.log(err)}
            else{
                if (result.length == 0) {
                    console.log("memo 기록 하나도 없다네")
                } else {
                  console.log("adim memo 에 기록 정상 ")
                }
}})}


router.get('/gameang', async (req, res)=>{
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
                    req.session.logined=result7[0]
                
                const balance = result7[0].charge_amount
                const phone = req.body.phone
                const s = req.body.state 
            
                res.render('gameang', {
                    amount : balance,
                    phonenum : phone,
                    username : req.session.logined.username,
                    state : 0
                })}})
}}) 

router.get('/gam_7', async (req, res)=>{
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
                    req.session.logined=result7[0]
                
                const balance = result7[0].charge_amount
                const phone = req.body.phone
                const _storename  = "등촌생고기"
                const _storephone  = "01072812508"
                console.log("_storename =", _storename  )
            
                res.render('gamepay', {
                    amount : balance,
                    phonenum : phone,
                    username :result7[0].username,
                    storename: _storename,
                    storephone: _storephone,
                    state : 0
                })}})
    }}) 


    
module.exports = {

    log_info_insert_memo

}