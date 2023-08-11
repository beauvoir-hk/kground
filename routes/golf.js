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


router.get('/ksfc', function(req, res){
    if(!req.session.logined){
        console.log(req.session.logined)
        res.redirect("/")

    }else{
        const phone=req.session.logined.phone

        // 기 등록한 데이터 입력 받지 않고 db에서 획득  
        const sql = `
            select
            *
            from
            ksfc
            where 
            phone = ?`
        const values = [phone]
        connection.query(
            sql, 
            values,  
            function(err, result){
                if(err){
                    console.log(err)
                }else{
                    res.render("ksfc",{
                        phone:phone,
                        state:5,
                        resultt:result
                    })}
        })}})


// localhost:3000/golf/  [get]
router.post('/ksfc', async  function(req, res){
    if(!req.session.logined){
        console.log(req.session.logined)
        res.redirect("/")

    }else{
        const phone=req.session.logined.phone
        console.log("ksfc  phone=", phone)
                                                                   
        // 유저가 입력한 데이터를 변수에 대입 
        const _gamenumber = await req.body.input_gamenumber
        const _gender =await  req.body.input_gender
        const _jiyeok =await  req.body.input_jiyeok
        const _birth = await req.body.input_birth
        const _golfsys = await req.body.input_golfsys

        console.log("같은 시스템이 아니니 등록")
        console.log("이거?",_gamenumber, _gender, _jiyeok, _birth ,_golfsys)



        //username구하기
        const sql = `
                select
                *
                from
                log_info
                where 
                phone = ?`
            const values = [phone]
            connection.query(
                sql, 
                values,  
                function(err, result){
                    if(err){
                        console.log(err)
                    }else{
                        const _username=result[0].username

                        const _bestscore = 9999
                        const _registtime = moment().format('YYYY-MM-DDTHH:mm:ss')
                        const _sysrank = 9999
                        console.log(phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_registtime)
                        kpoint.ksfc_insert(phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_sysrank, _registtime)

                        res.render("ksfc_list",{
                            phone:phone,
                            username:_username,
                            amount:req.session.logined.charge_amount,
                            resultt2:result
                        })}
                    })
                }})



router.get('/ksfc1', function(req, res){
        if(!req.session.logined){
            console.log(req.session.logined)
            res.redirect("/")
    
        }else{
            const phone=req.session.logined.phone

  // 기 등록한 데이터 입력 받지 않고 db에서 획득  
        const sql = `
            select
            *
            from
            ksfc
            where 
            phone = ?`
        const values = [phone]
        connection.query(
            sql, 
            values,  
            function(err, result){
                if(err){
                    console.log(err)
                }else{
                    res.render("ksfc1",{
                        phone:phone,
                        state:5,
                        resultt:result
                    })
 }})}})

 //참가 추가 신청
router.post('/ksfc1', async  function(req, res){
    let state=0
    if(!req.session.logined){
        console.log(req.session.logined)
        res.redirect("/")

    }else{
        const phone=req.session.logined.phone
        console.log("ksfc1  phone=", phone)   
        const sql = `
            select
            *
            from
            ksfc
            where 
            phone = ?
            `
        const values = [phone]
        connection.query(
            sql, 
            values,  
            function(err, receipt){
                if(err){
                    console.log(err)
                }else{
                    if(receipt.length==0){
                        res.render("ksfc",{
                            phone:phone,
                            state:5,
                            resultt: receipt
                        })
                    }else{

                        // 기 등록한 데이터 입력 받지 않고 db에서 획득  
                        const _gamenumber = req.body.input_gamenumber
                        const _gender =req.body.input_gender
                        const _jiyeok =req.body.input_jiyeok
                        const _birth = req.body.input_birth


                        const add_golfsys = req.body.input_golfsys

                        const sys_count = receipt.length
                        for(var i=0;i<sys_count;++i){
                            if( add_golfsys==receipt[i].golfsys){
                                res.render("ksfc1",{
                                    phone:phone,
                                    state:3,
                                    resultt:result
                                })
                            }else{
                                
                                            
                                const sql = `
                                    select
                                    *
                                    from
                                    log_info
                                    where 
                                    phone = ?`
                                const values = [phone]
                                connection.query(
                                    sql, 
                                    values,  
                                    function(err, receipt){
                                        if(err){
                                            console.log(err)
                                        }else{
                                            const _username=receipt[0].username

                                            const _bestscore = 9999
                                            const _registtime = moment().format('YYYY-MM-DDTHH:mm:ss')
                                            const _sysrank = 9999
                                            console.log(phone, _username, _gamenumber, _gender, _jiyeok, _birth ,add_golfsys ,_bestscore,_registtime)
                                            kpoint.ksfc_insert(phone, _username, _gamenumber, _gender, _jiyeok, _birth ,add_golfsys ,_bestscore,_sysrank, _registtime)

                                            res.render("ksfc_list",{
                                                resultt2:receipt,
                                                phone:phone,
                                                username:_username,
                                                amount:req.session.logined.charge_amount
                                            })
 }})}}}}})}})


    // stroke_rank
    router.get('/ksfc_list', async (req, res)=>{
        let rank=[]
        if(!req.session.logined){
            res.redirect("/")
        }else{    
            const _user = req.session.logined.username
            const _phone = req.session.logined.phone 
            const _amount= req.session.logined.charge_amount
            //phone번호로 로그인된 세션의 score만 읽어온다
            const sql = `
                select 
                *
                from 
                ksfc
                order by bestscore ASC
                `
            const values = [_phone]
            connection.query(
                sql, 
                values, 
                function(err, result){
                    if(err){
                        console.log(err)
                        state=false
                    }else{
                        state=true
                        let len = result.length
                        console.log("len ksfc  =",len )   
                        //골프시스템별 bestscore구하기
                        const sql2 = `
                            select 
                            *
                            from 
                            ksfc
                            where phone=?
                            ORDER BY bestscore ASC
                            `
                            const values2 = [_phone]
                            connection.query(
                                sql2, 
                                values2, 
                                function(err, result2){
                                    if(err){
                                        console.log(err)
                                    }else{
                                        let lensys=result2.length
                                        
                                        for(j=0;j<lensys;j++){
                                            for(i=0;i<len;i++){
                                                if(result2[j].bestscore == result[i].bestscore){
                                                    rank[j]=i+1
                                                }}}
                                        
                                        res.render('ksfc_list', {
                                            'resultt': result,  //golfsys
                                            'resultt2': result2,//bestscore순
                                            'username' : _user, 
                                            'phone': _phone,
                                            amount:_amount,
                                            'len': len,
                                            rank:rank,
                                            'state':state
                                            })  
                             }})
                        
                    }
                })}})     
// stroke_rank
router.get('/ksfc_list1', async (req, res)=>{
    let rank=[]
    if(!req.session.logined){
        res.redirect("/")
    }else{    
        const _user = req.session.logined.username
        const _phone = req.session.logined.phone 
        const _amount= req.session.logined.charge_amount
        //phone번호로 로그인된 세션의 score만 읽어온다
        const sql = `
            select 
            *
            from 
            ksfc
            order by bestscore ASC
            `
        const values = [_phone]
        connection.query(
            sql, 
            values, 
            function(err, result){
                if(err){
                    console.log(err)
                    state=false
                }else{
                    state=true
                    let len = result.length
                    console.log("len ksfc  =",len )   
                    //골프시스템별 bestscore구하기
                    const sql2 = `
                        select 
                        *
                        from 
                        ksfc
                        where phone=?
                        ORDER BY bestscore ASC
                        `
                        const values2 = [_phone]
                        connection.query(
                            sql2, 
                            values2, 
                            function(err, result2){
                                if(err){
                                    console.log(err)
                                }else{
                                    let lensys=result2.length
                                    
                                    for(j=0;j<lensys;j++){
                                        for(i=0;i<len;i++){
                                            if(result2[j].bestscore == result[i].bestscore){
                                                rank[j]=i+1
                                            }}}
                                    
                                    res.render('ksfc_list', {
                                        'resultt': result,  //golfsys
                                        'resultt2': result2,//bestscore순
                                        'username' : _user, 
                                        'phone': _phone,
                                        amount:_amount,
                                        'len': len,
                                        rank:rank,
                                        'state':state
                                        })  
                         }})
                    
                }
            })}})                                                 
                        

    // stroke_rank
    router.get('/stroke_rank', async (req, res)=>{
        const rank=[]
        const user = req.session.logined.username
        const phone = req.session.logined.phone 
        if(!req.session.logined){
            res.redirect("/")
        }else{    

            //phone번호로 로그인된 세션의 golfsys만 읽어온다
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
                function(err, my){
                    if(err){
                        console.log(err)
                        state=false
                    }else{
                        state=true
                        let len =0
                        len=my.length
    
                        //골프시스템별 bestscore구하기(전체모두 부르기)
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
                                function(err, all){
                                    if(err){
                                        console.log(err)
                                    }else{
                                    console.log("골프시스템 =",my)
                                    const etc=all.length

                                     for(var j=0; j<len; j++){
                                        for(var i=0; i<etc; i++){
                                            if(my[j].bestscore==all[i].bestscore){
                                            rank[j]=i+1
                                            }
                                     } }  

                                    res.render('stroke_rank', {
                                        'resultt':my,  //golfsys
                                        'resultt2': all,//bestscore순
                                        'username' : user, 
                                        'phone': phone,
                                        'len': len,
                                        etc:etc,
                                        myrank:rank,
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