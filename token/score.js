
// express를 사용하기 위하여 express 모듈을 로드 
const express = require('express')
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

//충전 리스트에 기록
async function chargelist_insert(_phone,chargedate, price){
       
    const sql = `
        insert 
        into 
        charge_list
        values (?,?,?)
        `
    const values = [_phone, chargedate, price ]
    connection.query(
    sql, 
    values, 
    function(err, result){
        if(err){
            console.log(err)
            res.send(err)
            }else{
                console.log("충전 정상 charge list 기록")
                }
        return "토큰 발행 완료"
    })}

//원본 디비에 충전금액 수정 
async function log_info_amount_update(_phone,price ){   
    const  chargeamount=req.session.logined.charge_amount
    const _charge_amount = parseInt(chargeamount) + parseInt(price)
    req.session.logined.charge_amount =_charge_amount
    const sql2 = `
        update
        log_info
        set
        charge_amount = ?
        where
        phone = ?
        `
    const values2 = [_charge_amount, _phone]
                    
    connection.query(
        sql2, 
        values2, 
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
                }else{
                    console.log("charge 성공")
                }
            })}

//kpoint list에 기록
async function kpoint_list_insert(_phone, trans_tp,  chargedate, price ){   
    const sql = `
        insert 
        into 
        kp_list
        values (?,?,?,?)
        `
    const values = [_phone, chargedate, trans_tp, price ]
    connection.query(
        sql, 
        values, 
        function(err, result){
            if(err){
                console.log(err)
            }else{
                console.log("kpoint list에 기록 정상+본문으로 돌아가고싶다")
            }})}

//storepayt list에 기록
async function store_list_insert(_input_dt, _phone, _username, _storename, pay_amount ){   
    const sql=
            `
            insert 
            into 
            store_pay
            values ( ?, ?, ?, ?, ? )
            `
    const values = [_input_dt, _phone, _username, _storename, pay_amount]
    
    connection.query(
        sql,
        values,
        (err, result)=>{
            if(err){
                res.send(err)
            }else{
                console.log("상점 거래내역 기록= ",result)
            }
        })
    return result
    }  
        
//기존 store amount select
async function store_select(_input_dt, _phone, _username, _storename, pay_amount ){ 

    const sql2 = `
        select 
        *
        from 
        store
        where 
        storename = ?
        `
    const values2 = [ _storename]
    connection.query(
        sql2, 
        values2, 
        function(err, result2){
            if(err){
                console.log(err)
            }else{  
                console.log("//기존 store amount select resultt=",result2) 
            }
        })
    }

module.exports = {
    chargelist_insert,
    log_info_amount_update, 
    kpoint_list_insert, 
    store_list_insert,
    store_select
}


// 함수 호출
// balance_of('0x3778671B6beA5D1dcdd059F1e226B096c82c13a0')
// create_wallet()

// 함수 호출 
// trans_from_token(process.env.private_key2, 10)


// trade_token('0x2aB031861b7672Df302527129AA090B060496Df5', 111)


// 토큰 생성 함수를 호출
// create_token('test', 'tes', 0, 100000)

// // JSON형태 파일을 생성
// const fs = require('fs')
// const test = {
//     name : 'test'
// }
// // 파일에 데이터를 넣기 위해서는 문자형으로 변환 
// const testJSON = JSON.stringify(test)

// console.log(testJSON)

// fs.writeFileSync('test.json', testJSON)