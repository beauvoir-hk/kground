
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
    })}

//원본 디비에 충전금액 수정 
async function log_info_amount_update(_phone,ch_amount ){   
    
    const sql2 = `
        update
        log_info
        set
        charge_amount = ?
        where
        phone = ?
        `
    const values2 = [ch_amount, _phone]
                    
    connection.query(
        sql2, 
        values2, 
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
                }else{
                    console.log("charge 수정 성공")
                }
            })}

//kpoint list에 충전기록
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
//충전------------------------------------------------------------

//가맹점==========================================================
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
           
        })}  


        
//기존 store amount select
async function storeamount_update( _storename, charge_amount ){ 
    const sql3 = `
        update
        store
        set
        store_amount = ?
        where
        storename = ?
            `
        const values3 = [charge_amount, _storename]
        connection.query(
            sql3, 
            values3, 
            function(err, result3){
                if(err){
                    console.log(err)
                }else{
                    console.log("//store의 chage금액 수정=",charge_amount, _storename)
                }})}          
//가먕점 ---------------------------------------------------------------------

//페스티벌 참가===============================================================
//참가비결제를 위해 참가 list (최근순)
async function enterpay_time( phone){ 
    const sql = `
        select 
        *
        from 
        score
        where 
        phone = ?
        order by entertime DESC
        `
    const values = [phone]
    connection.query(
    sql, 
    values, 
    function(err, result){
        if(err){
            console.log(err)
            let data=0
        }else{
            data=1
             }
             return result
            })
            
        }

//상위 5개 score출력을 위한 준비(스코어순)
async function enterpay_score( phone){ 
    const sql2 = `
        select 
        *
        from 
        score
        where 
        phone = ?
        order by strok ASC
        `
    const values2 = [phone]
    connection.query(
    sql2, 
    values2, 
    function(err, result2){
        if(err){
            console.log(err)
            let data=0
        }else{
            console.log(err)
        }
        return result2
    })}
//------------------------------

//enterpay ===============================


module.exports = {
    chargelist_insert,
    log_info_amount_update, 
    kpoint_list_insert, 
    store_list_insert,
    storeamount_update,
    enterpay_time,
    enterpay_score
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