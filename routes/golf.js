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
            const _phone=req.body.phone
            const phone=req.session.logined.phone
            //기신청자 인지 판단하자
            const sql = `
                select
                *
                from
                ksfc
                where 
                phone = ?`
            const values = [_phone]
            connection.query(
                sql, 
                values,  
                function(err, receipt){
                    if(err){
                        console.log(err)
                    }else{
                        if(receipt.length!=0){
                            
        //폰에서 같은 golfsys 가 있으면 이미 등록되어 있나???
                            for(var i=0; i<receipt.length;i++){
                                if(_golfsys == receipt[i].golfsys){
                                    data=3
                                }else{
                                    data=0
                                }
                            }
                            if(data==0){
                                //기등록 시스템이 아니다...모두 입력 받아야 함          
                                console.log("같은 시스템이 아니니 등록")
                                res.render("ksfc",{
                                    state:5
                                })
                            }else{
                                //기등록 시스템이니 ... 골프시스템만 다시 입력
                                res.render("ksfc1",{
                                    resultt:receipt,

                                    state:5
                                })
                                }
                        }else{
                            res.render("ksfc",{
                                state:5
                            })}
                        }
                    })}})


// localhost:3000/golf/  [get]
router.post('/ksfc', async  function(req, res){
    let data=0
    const _phone=""
    if(req.body.state==0){ //로그인없이 회원가입 후 바로 옴
            _phone=req.body.phone
        }else{
            const _phone = req.session.logined.phone
            const _username=   req.session.logined.username
            const _amount=req.session.logined.charge_amount
                                                
            // 유저가 입력한 데이터를 변수에 대입 
            const _gamenumber = await req.body.input_gamenumber
            const _gender =await  req.body.input_gender
            const _jiyeok =await  req.body.input_jiyeok
            const _birth = await req.body.input_birth
            const _golfsys = await req.body.input_golfsys

            //기신청자 인지 판단하자
            const sql = `
                select
                *
                from
                ksfc
                where 
                phone = ?`
            const values = [_phone]
            connection.query(
                sql, 
                values,  
                function(err, receipt){
                    if(err){
                        console.log(err)
                     }else{
                        if(receipt.length!=0){
                            console.log("receipt.length",receipt.length)
     //폰에서 같은 golfsys 가 있으면 이미 등록되어 있음 경고
                            for(var i=0; i<receipt.length;i++){
                                if(_golfsys == receipt[i].golfsys){
                                    data=3
                                }else{
                                    console.log("같은 golfsys 없음")
                                }
                            }
                            console.log("data==",data)
                            console.log("receipt[0].golfsys=",receipt[0].golfsys)
                            console.log("_golfsys=",_golfsys)
                            const _phone = req.session.logined.phone
                            const _username=   req.session.logined.username
//기등록 시스템이 아니면

                            if(data==0){
           
                                console.log("같은 시스템이 아니니 등록")
                                console.log("이거?",_gamenumber, _gender, _jiyeok, _birth ,_golfsys)

                                const _bestscore = 9999
                                const _registtime = moment().format('YYYY-MM-DDTHH:mm:ss')
                                const _sysrank = 9999
                                console.log(_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_registtime)
                                kpoint.ksfc_insert(_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_sysrank, _registtime)
 
                                res.render("ksfc_list",{
                                    phone:_phone,
                                    username:_username,
                                    amount:_amount,
                                    resultt2:receipt
                                })
                            
//기 시스템과 같으면 ksfc
                             }else{
                                res.render('index.ejs', {
                                    'login_data': req.session.logined,
                                    'amount' : req.session.logined.charge_amount,
                                })
                                }
                                   
                        }else{
                            //등록된 내용이 하나도 없으면
                            console.log("같은 시스템이 아니니 등록")
                                console.log("이거?",_gamenumber, _gender, _jiyeok, _birth ,_golfsys)

                                const _bestscore = 9999
                                const _registtime = moment().format('YYYY-MM-DDTHH:mm:ss')
                                const _sysrank = 9999
                                console.log(_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_registtime)
                                kpoint.ksfc_insert(_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_sysrank, _registtime)

                                res.render("ksfc_list",{
                                    resultt2:receipt,
                                    phone:_phone,
                                    username:_username,
                                    amount:_amount
                                })
                            }
                        }
                    }
                )}})

router.post('/ksfc1', async  function(req, res){

            // 기 등록한 데이터 입력 받지 않도록  
            const _gamenumber = await req.body.input_gamenumber
            const _gender =await  req.body.input_gender
            const _jiyeok =await  req.body.input_jiyeok
            const _birth = await req.body.input_birth
            const _golfsys = await req.body.input_golfsys
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
            const _bestscore = 9999
            const _registtime = moment().format('YYYY-MM-DDTHH:mm:ss')
            const _sysrank = 9999
            console.log(_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_registtime)
            kpoint.ksfc_insert(_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_sysrank, _registtime)
 
            res.render("ksfc_list",{
                resultt2:result,
                phone:_phone,
                username:_username,
                amount:req.session.logined.charge_amount
            })
 }})})


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