
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


//my : log_info 리스트에 갱신기록
async function log_info_update(_nickname,_refferal,  _amount,  _tier,_phone ){
        //user_info에 대해 갱신
        const sql3 = `
            update
            log_info
            set
            refferal=?,
            nickname=?,
            charge_amount = ?,
            tier=?
            where
            phone = ?
            `
        const values3 =[_refferal,_nickname,  _amount,  _tier, _phone ]    
        connection.query(
            sql3, 
            values3,
        function(err, result3){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                console.log("user_info에 대해 갱신")
                
                }})
}


//충전 리스트에 기록
async function chargelist_insert(_phone,chargedate, price){
    const refferalcha = parseInt(price) * 0.1 
    const refferalch = Math.round(refferalcha) //추천보너스
    const sql2 = `
        select 
        *
        from 
        log_info
        where 
        phone = ?
        `
    const values2 = [_phone]
    connection.query(
    sql2, 
    values2, 
    function(err, result2){
        if(err){
            console.log(err)
        }else{
            console.log(" charge list 기록준비",_phone,chargedate, price )
            //기존charge에 추천보너스 더하기    
            const refferalcharge=parseInt(price) + parseInt(refferalch)  
            console.log(" 기존charge에 추천보너스 더하기",_phone,chargedate, refferalcharge )
            const sql = `
                insert 
                into 
                charge_list
                values (?,?,?)
                `
            const values = [_phone, chargedate , refferalcharge ]
            connection.query(
                sql,
                values,
                (err, result)=>{
                    if(err){   
                        console.log(err)}
                        else{
                            if (result.length == 0) {
                                console.log("충전 자료가 하나도 없다네")
                            } else {

                            console.log("충전 정상 charge list 기록")
                            
                                }
                            }})
   }})
}

//원본 디비에 금액 추가 수정(festival, store=gamepay, transpay) 
async function log_info_amount_update2(_phone, price ){   
    const sql2 = `
        select 
        *
        from 
        log_info
        where 
        phone = ?
        `
    const values2 = [_phone]
    connection.query(
    sql2, 
    values2, 
    function(err, result2){
        if(err){
            console.error(err)
            }else{
                //추천보너스 계산
                // const refferalcha = parseInt(price) * 0.1 
                // const refferalch = Math.round(refferalcha) 
                //기존charge에 추천보너스 더하기 
                const ch_amount=parseInt(result2[0].charge_amount) + parseInt(price)    
                console.log(" 기존charge에 추천보너스 더하기",
                            _phone,result2[0].charge_amount ,price, ch_amount )
                const sql = `
                    update
                    log_info
                    set
                    charge_amount = ?
                    where
                    phone = ?
                    `
                const values = [ch_amount, _phone]
                                
                connection.query(
                    sql, 
                    values, 
                    function(err, result){
                        if(err){
                            console.error(err)
                            }else{
                                console.log("log_info 추가 금액 더해서 수정 성공")
                             
                            }
                        })}})}


//원본 디비에 금액 감액 수정(festival, store=gamepay, transpay) 
async function log_info_amount_update1(_phone, price ){   
    const sql2 = `
        select 
        *
        from 
        log_info
        where 
        phone = ?
        `
    const values2 = [_phone]
    connection.query(
    sql2, 
    values2, 
    function(err, result2){
        if(err){
            console.error(err)
            }else{
                //추천보너스 계산
                // const refferalcha = parseInt(price) * 0.1 
                // const refferalch = Math.round(refferalcha) 
                //기존charge에 추천보너스 더하기 
                const ch_amount=parseInt(result2[0].charge_amount) - parseInt(price)    
                console.log(" 기존charge에 감액하기",
                            _phone,result2[0].charge_amount ,price, ch_amount )
                const sql = `
                    update
                    log_info
                    set
                    charge_amount = ?
                    where
                    phone = ?
                    `
                const values = [ch_amount, _phone]
                                
                connection.query(
                    sql, 
                    values, 
                    function(err, result){
                        if(err){
                            console.error(err)
                            }else{
                                console.log("log_info 감액 수정 성공")
                             
                            }
                        })}})}


//원본 디비에 충전금액 수정 
async function log_info_amount_update(_phone, price ){   
    const sql2 = `
        select 
        *
        from 
        log_info
        where 
        phone = ?
        `
    const values2 = [_phone]
    connection.query(
    sql2, 
    values2, 
    function(err, result2){
        if(err){
            console.error(err)
            }else{
                //추천보너스 계산
                const refferalcha = parseInt(price) * 0.1 
                const refferalch = Math.round(refferalcha) 
                //기존charge+ 충전금액 + 추천보너스 
                const ch_amount=parseInt(result2[0].charge_amount) + parseInt(price) +parseInt(refferalch)    
                console.log(" 기존charge에 추천보너스 더하기",
                            _phone,result2[0].charge_amount ,price, ch_amount )
                            
                const sql = `
                    update
                    log_info
                    set
                    charge_amount = ?
                    where
                    phone = ?
                    `
                const values = [ch_amount, _phone]
                                
                connection.query(
                    sql, 
                    values, 
                    function(err, result){
                        if(err){
                            console.error(err)
                            }else{
                                console.log("charge 수정 성공",result )
                             
                            }
                        })}})}


//원본 디비에 추천금액 수정 
async function log_info_refferal_update(_phone,price ){
    const sql2 = `
        select 
        *
        from 
        log_info
        where 
        phone = ?
        `
    const values2 = [_phone]
    connection.query(
    sql2, 
    values2, 
    function(err, result2){
        if(err){
            console.log(err)
        }else{
            const reffer= result2[0].refferal
            if(reffer==""){
                console.log("추천인 없음")
            }else{
                const sql3 = `
                    select 
                    *
                    from 
                    log_info
                    where 
                    refferal = ?
                    `
                const values3 = [reffer]
                connection.query(
                sql3, 
                values3, 
                function(err, result3){
                    if(err){
                        console.log(err)
                    }else{
                    const phone= result3[0].phone
                    const chargeamount=ParseInt(result3[0].charge_amount)+parseInt(price)

                    console.log("추천인의 phone",phone, price,chargeamount )    

                    const sql2 = `
                        update
                        log_info
                        set
                        charge_amount = ?
                        where
                        phone = ?
                        `
                    const values2 = [chargeamount, phone]
                                    
                    connection.query(
                        sql2, 
                        values2, 
                        function(err, result2){
                            if(err){
                                console.error(err)
                                }else{
                                    console.log("charge 수정 성공")
                                   
                                }})
                        }})
                    }}})}

//kpoint list에 충전기록
async function kpoint_list_insert(_phone, trans_tp,  chargedate, price, charge_amount ){  
     
    console.log("회원끼리의 거래내역을 kp_list에 insert",_phone, trans_tp,  chargedate, price,charge_amount) 
    
    const sql = `
        insert 
        into 
        kp_list
        values (?,?,?,?,?)
        `
    const values = [_phone, chargedate, trans_tp, price,charge_amount ]

    connection.query(
        sql,
        values,
        (err, result)=>{
            if(err){   
                console.log(err)}
                else{
                    if (result.length == 0) {
                        console.log("kpoint list에 기록 하나도 없다네")
                    } else {
                      console.log("kpoint list에 기록 정상+본문으로 돌아가고싶다")
                    }
    }})
 }


 async function kpoint_list_event_insert(_phone, trans_tp,  chargedt, price, charge_amount ){   
    const chargedate = moment(chargedt).add(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
    const sql2 = `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                `
            const values2 = [_phone]
            connection.query(
            sql2, 
            values2, 
            function(err, result2){
                if(err){
                    console.log(err)
                }else{
                    const eventcha = parseInt(price) * 0.1 
                    const eventch = Math.round(eventcha) 
                    const ch_amount=parseInt(charge_amount) + parseInt(eventch) 
                     
                    console.log("충전 이벤트,, kp_list에 insert", _phone, trans_tp,  chargedate, eventch , ch_amount) 
                    
                    const sql = `
                        insert 
                        into 
                        kp_list
                        values (?,?,?,?,?)
                        `
                    const values = [_phone, chargedate, trans_tp, eventch, ch_amount ]

                    connection.query(
                        sql,
                        values,
                        (err, result)=>{
                            if(err){   
                                console.log(err)}
                                else{
                                    if (result.length == 0) {
                                        console.log("kpoint list에 기록 하나도 없다네")
                                    } else {
                                    console.log("kpoint list에 기록 정상+본문으로 돌아가고싶다")
                                    }
                    }})}})
 }

  //kpoint list에 충전기록
async function kpoint_list_refferal_insert(_phone, trans_tp,  chargedt, price, charge_amount ){   
    const chargedate = moment(chargedt).add(2, 'seconds').format('YYYY-MM-DDTHH:mm:ss')
    console.log("충전이벤트 kp_list에 insert",_phone, trans_tp,  chargedate, price, charge_amount) 
    
    const sql2 = `
                select 
                *
                from 
                log_info
                where 
                phone = ?
                `
            const values2 = [_phone]
            connection.query(
            sql2, 
            values2, 
            function(err, result2){
                if(err){
                    console.log(err)
                }else{
                    const reffer= result2[0].refferal
                    console.log("reffer=", reffer)
                    //추천인이 있는지 확인
                    if(reffer==""){
                        console.log("추천인 없음")
                    }else{
                        //추천인이 있으면 추천인 전번구하기
                        const sql3 = `
                            select 
                            *
                            from 
                            log_info
                            where 
                            username = ?
                            `
                        const values3 = [reffer]
                        connection.query(
                        sql3, 
                        values3, 
                        function(err, result3){
                            if(err){
                                console.log(err)
                            }else{
                                //추천인전번확보
                                const phone= result3[0].phone
                                console.log("reffer's phone=", phone,result3[0].charge_amount )
                                //추천보너스 계산
                                const eventcha = parseInt(price) * 0.1 
                                const eventch = Math.round(eventcha) 
                                //추천인의 충전금액+추천보너스
                                const chargeamount = parseInt(result3[0].charge_amount)+parseInt(eventch)

                                console.log("추천인의 phone",phone, chargedate, trans_tp, eventch,chargeamount )

                                const sql = `
                                    insert 
                                    into 
                                    kp_list
                                    values (?,?,?,?,?)
                                    `
                                const values = [phone, chargedate, trans_tp,eventch,chargeamount  ]

                                connection.query(
                                sql,
                                values,
                                (err, result)=>{
                                    if(err){   
                                        console.log(err)}
                                        else{
                                            if (result.length == 0) {
                                                console.log("kpoint list에 기록 하나도 없다네")
                                            } else {
                                            console.log("kpoint list에 기록 정상+본문으로 돌아가고싶다")
                                            }}})
                                        }})
}}})}
   
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
                console.log(err)}
                else{
                    if (result.length == 0) {
                        console.log("가맹점 거래내역 기록 하나도 없다네")
                    } else {
                      console.log("가맹점 거래내역 기록= ",result)
                    }
    }})    
 }  

        
//기존 store amount select
async function storeamount_update( _storename, save_amount ){ 
    const sql3 = `
        update
        store
        set
        store_amount = ?
        where
        storename = ?
            `
        const values3 = [save_amount, _storename]
        connection.query(
            sql3, 
            values3, 
            function(err, result3){
                if(err){
                    console.log(err)
                }else{
                    if(result3.affectedRows!=0){
                        console.log("//store의 chage금액 수정=",save_amount, _storename)
                        
                    }else{
                        console.log("가맹점 테이블 수정완료이 완료되지 못했습니다")
                        res.render("gamepay",
                        {
                            state:0
                        })}
                    
                }})}          
//가먕점 ---------------------------------------------------------------------

//페스티벌 참가===============================================================
//참가비결제를 위해 참가 list (최근순)
async function enterscore_update(_golfsys, stroke,  _scorepicture, entertime){  
    console.log("entertime으로 score 수정준비",_golfsys, stroke,  _scorepicture, entertime)
    const sql = `
                update
                score
                set
                golfsys=?,
                strok = ?,
                scorepicture=? 
                where
                entertime = ?
                `
            const values = [_golfsys, stroke,_scorepicture,  entertime]
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
                console.log(err)}
                else{
                    if (result.length == 0) {
                        console.log("대회참가비 결제  기록 하나도 없다네")
                    } else {
                      console.log("대회참가비 결제 sucess")
                    }
    }})   
}

//대회참가비 결제------------------------------

//친구끼리 거래내역 ===============================            
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
                console.log(err)}
                else{
                    if (result.length == 0) {
                        console.log("KPoint 거래내역 기록 하나도 없다네")
                    } else {
                      console.log("KPoint 거래내역 기록= ",result.length)
                    }
    }}) 
} 
    
    
// KSFC ===============================            
async function ksfc_update(_bestscore, _sysrank, _phone, _golfsys )  {

    console.log(" ksfc_update==========",  _bestscore, _sysrank, _phone, _golfsys)
    
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
                console.log(err)}
                else{
                    if (result.length == 0) {
                        console.log("KSFC 기록 하나도 없다네")
                    } else {
                      console.log(" bestscore=?, sysrank=?거래내역 기록= ",result)
                    }
    }}) 
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
                    console.log(err)}
                    else{
                        if (result.length == 0) {
                            console.log("KSFC 기록 하나도 없다네")
                        } else {
                          console.log("KSFC 기록= ",result.lengt)
                        }
        }}) 
    } 
        
    
async function tier_update( _phone, _gender)  {
    let wrank=0
    let champsys=""
    let sysrank=0

// 나의   golfsys 필드기준 정렬, rank가 가장 낮은 레코드를 선택
    const sql=
        `
        SELECT
        *
        FROM
        ksfc
        WHERE phone=?
        ORDER BY sysrank ASC
        `
    const values=[_phone]
    connection.query(
        sql,
        values,
        (err, result)=>{
            if(err){
                console.error(err)
            }else{
                champsys=result[0].golfsys//rank 오름차순정렬 가장낮은 골프시스템
                sysrank = parseInt(result[0].rank)//가장낮은 골프시스템의 rank
                console.log(" 내 rank가 가장 낮은 레코드를 선택",result)
                console.log(" 내 rank가 가장 낮은 레코드의 골프시스쳄과 순위",champsys,sysrank)

                // 골프시스템 카운팅(성별)
                const sql=
                    `
                    SELECT 
                    golfsys, COUNT(*) AS count
                    FROM ksfc
                    where golfsys=? && gender=?
                `
                //ORDER BY sysrank ASC 
                    
                const values=[champsys, _gender]//내 1등 골프시스템& 성별 기준의 골프시스템과 갯수 
                connection.query(
                    sql,
                    values,
                    (err, result2)=>{
                        if(err){
                            console.error(err)
                        }else{
                            console.log(" where golfsys=? && gender=?",champsys, _gender)
                            console.log(" 성별 ksfc 테이블에서 제일 잘한 golfsys 레코드의 수",result2)
                            wrank=parseInt(result2[0].count)//레코드의 갯수
                            console.log("wrank=", wrank)
                            const tier=1
                            if(wrank>5){
                                
                                if(sysrank > wrank /60){
                                    tier=1
                                }else{
                                    if(sysrank > wrank/30){
                                        tier=2
                                    }else{
                                        if(sysrank > wrank/5){
                                            tier=3
                                        }else{
                                            tier=4
                                    }}}
                            }else{
                                console.log("wrank가 5보다 작아 tier에 영행을 미치지 않는다" )
                            }
                       
//tier기록
                        const sql1=
                            `
                            update
                            log_info
                            set
                            tier=?
                            where
                            phone = ?
                            `
                        const values1 = [tier,_phone]
                        
                        connection.query(
                            sql1,
                            values1,
                            (err, result1)=>{
                                if(err){   
                                    console.log(err)}
                                    else{
                                        console.log("tier기록 완료")
                        }})
                    }}) 
                }})}


module.exports = {
    chargelist_insert,
    log_info_amount_update, 
    log_info_amount_update1,
    log_info_amount_update2,
    kpoint_list_insert, 
    kpoint_list_event_insert,
    store_list_insert,
    storeamount_update,
    enterscore_update,
    enterpay_score_insert,
    trans_list_insert,
    ksfc_update,
    tier_update,
    ksfc_insert,
    log_info_update,
    log_info_insert_memo,
    kpoint_list_refferal_insert,
    log_info_refferal_update
}

