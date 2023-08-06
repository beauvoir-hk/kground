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
            res.render('ksfc.ejs',{
                state:0,

                login_data : req.session.logined
            })
        }
    })

// localhost:3000/golf/  [get]
router.post('/ksfc', async  function(req, res){
    let data=0
    if(req.body.state==0){ //로그인없이 회원가입 후 바로 옴
            _phone=req.body.phone
        }else{
            const _phone = req.session.logined.phone
        

            // name 값은 로그인 데이터에서 name 값을 가지고 온다
            // 로그인 정보는 session 저장
            // name 값을 가지고 오려면 session 안에 있는 name을 추출
            
            const _username=   req.session.logined.username
            console.log(_username)
            // 유저가 입력한 데이터를 변수에 대입 
            const _gamenumber = await req.body.input_gamenumber
            const _gender =await  req.body.input_gender
            const _jiyeok =await  req.body.input_jiyeok
            const _birth = await req.body.input_birth
            const _golfsys = await req.body.input_golfsys
            
            console.log("이거?",_gamenumber, _gender, _jiyeok, _birth ,_golfsys)

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
                        console.log("kkkffsssssssssssc",receipt)
                        if(receipt.length!=0){

                            console.log("0개 아니면",receipt)

     //폰에서 같은 golfsys 가 있으면 이미 등록되어 있음 경고
                            for(var i=0; i<receipt.length;i++){
                                if(_golfsys == receipt[i].golfsys){
                                    data=3
                                }else{
                                    data=0
                                }
                            }
                        
                            if(data==3){
                                res.render("ksfc",{
                                    //이미 등록되어 있어요 3
                                    state:data
                                })
                            }else{
                                console.log("캍은 시스템이 아니니 등록")
                                const _bestscore = 9999
                                const _registtime = moment().format('YYYY-MM-DDTHH:mm:ss')
                                const _sysrank = 9999
                                console.log(_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_registtime)
                                kpoint.ksfc_insert(_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_sysrank, _registtime)
                                // res.render("ksfc_list",{
                                //         username: _username,
                                //         amount:req.session.logined.charge_amount
                                //     })
                                res.redirect("ksfc_list")

                            }
                        }else{
//갈은 시스템에 등록이 안되어 있으면 테이블에 삽입
                                const _bestscore = 9999
                                const _registtime = moment().format('YYYY-MM-DDTHH:mm:ss')
                                const _sysrank = 9999
                                console.log(_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_registtime)
                                kpoint.ksfc_insert(_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_sysrank, _registtime)
                                // res.render("ksfc_list",{
                                //         username: _username,
                                //         amount:req.session.logined.charge_amount
                                //     })
                                res.redirect("ksfc_list")
                            }}})}})

    // stroke_rank
    router.get('/ksfc_list', async (req, res)=>{
        let rank=[]
        if(!req.session.logined){
            res.redirect("/")
        }else{    
            const _user = req.session.logined.username
            const _phone = req.session.logined.phone 
            const _amount= req.session.logined.amount
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