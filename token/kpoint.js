
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

const payappApiDomain = 'api.payapp.kr';
const payappApiUrl = '/oapi/apiLoad.html';


// PayApp API에 POST 요청을 보내는 함수
async function payappOapiPost(postdata) {
    // POST 요청을 생성합니다.

//     const request = http.request('POST', `https://api.payapp.kr/oapi/apiLoad.html`, {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       });
      
//       request.on('response', async (response) => {
//         if (response.statusCode !== 200) {
//           throw new Error(`Invalid response status code: response.statusCode`);
//         }

//         // POST 요청에 헤더를 추가합니다.
//         request.set('Content-Type', 'application/x-www-form-urlencoded');
    
//         // POST 요청에 데이터를 추가합니다.
//         request.set('Content-Length', Buffer.byteLength(postdata));
    
//         // POST 요청을 보내고 응답을 수신합니다.
//         response = await request.send(postdata);
    
//         // 응답의 상태 코드를 확인합니다.
//         if (response.statusCode !== 200) {
//         throw new Error(`Invalid response status code: response.statusCode`);        }

//         // 응답의 본문을 반환합니다.
//         return await response.text();
//   })
}



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
            console.error(err)
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
                console.error(err)
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
                console.error(err)
            }else{
                console.log("kpoint list에 기록 정상+본문으로 돌아가고싶다",result)
            }})}
//충전------------------------------------------------------------

//가맹점==========================================================
//storepay list에 기록
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
                console.error(err)
            }else{
                console.log("상점 거래내역 기록= ",result.length)
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
async function enterscore_update(_golfsys, stroke, _scorepicture, entertime){  
    const sql = `
                update
                score
                set
                golfsys=?,
                strok = ?,
                scorepicture = ?
                where
                entertime = ?
                `
            const values = [_golfsys, stroke, _scorepicture, entertime]
            connection.query(
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                    }else{
                        console.log("entertime으로 score 수정한 결과물", result)
                    }})}
                    


//페스티벌 참가------------------------------

//enterpay ===============================
//대회참가비 결제score에 기록
async function enterpay_score_insert(_input_dt, _phone, _username, _golfsys, _strok , _picture){
    
    //스코어리스트에 기록
    console.log("score에 기록하는 내용 = ",_input_dt, _phone, _username, _golfsys,  _strok , _picture )
    const sql=
            `
            insert 
            into 
            score 
            values ( ?, ?, ?, ?, ? ,?)`

    const values = [_input_dt, _phone, _username, _golfsys, _strok , _picture]
    
    connection.query(
        sql,
        values,
        (err, result)=>{
            if(err){
                console.log(result)
                res.send(err)
            }else{
                console.log("//대회참가비 결제 sucess")
            }})}

//대회참가비 결제------------------------------

//Kpoint 거래내역 ===============================            
async function trans_list_insert(_input_dt, _phone, _username, receiptphone, pay_amount )  {
    const sql=
            `
            insert 
            into 
            trans_pay
            values ( ?, ?, ?, ?, ? )
            `
    const values = [_input_dt, _phone, _username, receiptphone, pay_amount]
    
    connection.query(
        sql,
        values,
        (err, result)=>{
            if(err){
                console.log(err)
            }else{
                console.log("KPoint 거래내역 기록= ",result.length)
            }
           
        })
    } 
    
    
//KSFC ===============================            
async function ksfc_update(_bestscore, _sysrank, _phone, _golfsys )  {
    //tier을 위한 준비
    const sql=
            `
            update
            ksfc
            set
            bestscore=?,
            sysrank=?
            where
            phone = ? && golfsys=? 
            `
    const values =  [_bestscore, _sysrank,  _phone, _golfsys]
    
    connection.query(
        sql,
        values,
        (err, result)=>{
            if(err){
                console.error(err)
            }else{
                console.log("KSFC 기록= ",result.length)
            }
           
        })
    }   

async function ksfc_insert(_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_sysrank, _registtime){ 
   

    const sql=  `             
        insert 
        into 
        ksfc
        values (?, ?,?, ?, ?, ?, ?,?,?,?)`
        const values =  [_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys,_bestscore,_sysrank, _registtime]
        
        connection.query(
            sql,
            values,
            (err, result)=>{
                if(err){
                    console.error(err)
                }else{
                    console.log("KSFC 기록됨= ",result.length)
                }
               
            })
 } 

    
async function tier_update( _phone, _gender)  {
    let wrank=0
    let champsys=""
    let sysrank=0

//    golfsys 필드마다 rank가 가장 낮은 레코드를 선택
    const sql=
        `
        SELECT 
        *
        FROM ksfc
        GROUP BY golfsys
        ORDER BY rank ASC;
        where phone=?
        LIMIT 1
        `
    const values=[_phone]
    connection.query(
        sql,
        values,
        (err, result)=>{
            if(err){
                console.error(err)
            }else{
                champsys=result[0].golfsys
                sysrank = parseInt(result[0].rank)
                console.log(" golfsys 필드마다 rank가 가장 낮은 레코드를 선택",result)
                const sql=
                    `
                    SELECT 
                    golfsys, COUNT(*) AS count
                    FROM ksfc
                    where golfsys=? && gender=?
                     
                `
                const values=[champsys, _gender]
                connection.query(
                    sql,
                    values,
                    (err, result2)=>{
                        if(err){
                            console.error(err)
                        }else{
                            console.log(" ksfc 테이블에서 제일 잘한 golfsys 레코드의 수",result2)
                            wrank=parseInt(result2[0])
                            if(sysrank>wrank /60){
                                tier=1
                            }else{
                                if(sysrank>wrank/30){
                                    tier=2
                                }else{
                                    if(sysrank>wrank/5){
                                        tier=3
                                    }else{
                                        tier=4
                                }}}
                        }

//tier기록
                        const sql=
                            `
                            update
                            log_info
                            set
                            tier=?
                            where
                            phone = ?
                            `
                        const values = [tier,_phone]
                        
                        connection.query(
                            sql,
                            values,
                            (err, result)=>{
                                if(err){   
                                    console.log(err)}
                                    else{
                                        console.log("tier기록 완료")
                        }})
                    }) 
                }})}


module.exports = {
    chargelist_insert,
    log_info_amount_update, 
    kpoint_list_insert, 
    store_list_insert,
    storeamount_update,
    enterscore_update,
    enterpay_score_insert,
    trans_list_insert,
    ksfc_update,
    tier_update,
    ksfc_insert,
    payappOapiPost
}

