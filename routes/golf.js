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
        //const gender =await  req.body.input_gender 
        const _jiyeok =await  req.body.input_jiyeok 
        //const _birth = await req.body.input_birth.trim()
        const _golfsys = await req.body.input_golfsys 

        
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
        function(err, result5){
            if(err){
                console.log(err)
            }else{

                
            // ksfc전체를 1등부터 순서대로 불러온다
            const sql = `
                select 
                *
                from 
                ksfc
                order by golfsys, bestscore ASC
                `
            //const values = [_phone]
            connection.query(
            sql, 
            //values, 
            function(err, result){
                if(err){
                    console.log(err)
                    state=false
                }else{
                    //기골프시스템 구하지
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
                        function(err, result2){
                            if(err){
                                console.log(err)
                            }else{
                                let st=0
                                for(var i=0;i<result2.length;++i){
                                    if(result2.golfsys==_golfsys){
                                        st=1
                                        break
                                    }}
                                if(st==0){
                                    console.log("//같은 시스템이 아니니 등록")
                                    
                                    const _username=result5[0].username
                                    const _birth = result2[0].birth
                                    const _bestscore = 9999
                                    const _registtime = moment().format('YYYY-MM-DDTHH:mm:ss')
                                    const _sysrank = 0
                                    const gender    = result5[0].gender.trim()
                                    const _gender = gender.trim()
                                    console.log("gender.trim() = ",_gender)
                                    console.log("ksfc_insert=",phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_registtime)
                                    kpoint.ksfc_insert(phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore, _sysrank, _registtime)
            
                                    res.render("ksfc_list",{
                                        phone:phone,
                                        username:_username,
                                        amount:req.session.logined.charge_amount,
                                        'resultt': result,  //전체 bestscore순
                                        'resultt2': result2//나의
                                    })                          
                                }else{
                                    const _bestscore = result2[0].bestscore
                                    const _sysrank= result2[0].sysrank
                                    
                                    const _golfsys=golf_sys
                                    kpoint.ksfc_update(_bestscore, _sysrank, phone, _golfsys  )
                                    console.log("회원정보 수정완료")
                                    res.render("ksfc_list",{
                                        phone:phone,
                                        username:_username,
                                        amount:req.session.logined.charge_amount,
                                        'resultt': result,  //전체 bestscore순
                                        'resultt2': result2,//나의
                                    })                 
                    }
                    }})}})
                }})
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
        function(err, result5){
            if(err){
                console.log(err)
            }else{

            // ksfc전체를 1등부터 순서대로 불러온다
            const sql = `
                select 
                *
                from 
                ksfc
                order by golfsys, bestscore ASC
                `
            // const values = [phone]
            connection.query(
            sql, 
        //     values, 
            function(err, result){
                if(err){
                    console.log(err)
                    state=false
                }else{
                    state=true
                    
                    //나의 ksfc
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
                        function(err, result2){
                            if(err){
                                console.log(err)
                            }else{
                                if(result2.length==0){
                                    res.render("ksfc",{
                                        phone:phone,
                                        state:5,
                                        resultt: result2
                                    })
                                }else{
                                    // 기 등록한 데이터 입력 받지 않고 db에서 획득  
                                    const _gamenumber = req.body.input_gamenumber 
                                    //const _gender =req.body.input_gender 
                                    const _jiyeok =req.body.input_jiyeok 
                                    //const _birth = req.body.input_birth
                                    const _username =req.session.logined.username
                                    const add_golfsys = req.body.input_golfsys 

                                    //////////////////////////////////////////
                                    let st=0
                                    for(var i=0;i<result2.length;++i){
                                        if(result2.golfsys==add_golfsys){
                                            st=1
                                            break
                                        }}
                                    if(st==0){
                                        console.log("//같은 시스템이 아니니 등록")
                                        
                                        const _username=result5[0].username
                                        const _birth = result2[0].birth
                                        const _bestscore = 9999
                                        const _registtime = moment().format('YYYY-MM-DDTHH:mm:ss')
                                        const _sysrank = 0
                                        const gender    = result5[0].gender.trim()
                                        const _gender = gender.trim()
                                        console.log("gender.trim() = ",_gender)
                                        console.log("ksfc_insert=",phone, _username, _gamenumber, _gender, _jiyeok, _birth , add_golfsys ,_bestscore,_registtime)
                                        kpoint.ksfc_insert(phone, _username, _gamenumber, _gender, _jiyeok, _birth , add_golfsys ,_bestscore, _sysrank, _registtime)
                
                                        res.render("ksfc_list",{
                                            phone:phone,
                                            username:_username,
                                            amount:req.session.logined.charge_amount,
                                            'resultt': result,  //전체 bestscore순
                                            'resultt2': result2//나의
                                        })                          
                                    }else{
                                        //같은 골프시스템인 경우 수정
                                        const _bestscore = result2[0].bestscore
                                        const _sysrank= result2[0].sysrank
                                        
                                        const _golfsys=add_golfsys
                                        console.log("같은 골프시스템인 경우 수정",_bestscore, _sysrank, phone, _golfsys)
                                        kpoint.ksfc_update(_bestscore, _sysrank, phone, _golfsys )
                                        console.log("회원정보 수정완료")
                                        res.render("ksfc_list",{
                                            phone:phone,
                                            username:_username,
                                            amount:req.session.logined.charge_amount,
                                            'resultt': result,  //전체 bestscore순
                                            'resultt2': result2,//나의

                                        })                 
                                        } }}
                            })
                        }})}})}})


    // stroke_rank
    router.get('/ksfc_list', async (req, res)=>{
        let rank=[]
        let golfs=["GolfZon","GolfZon Park", "Kakao Friends","UDR Golf","K Golf","GNC Golf","SG Golf" ,"MS Golf"]
        if(!req.session.logined){
            res.redirect("/")
        }else{    
            const _user = req.session.logined.username
            const _phone = req.session.logined.phone 
            const _amount= req.session.logined.charge_amount

            // score전체 호출--> bestscore 계산
            const sql = `
                select 
                *
                from 
                score5
                order by golfsys, phone ASC
                `
            //const values = [_phone]
            connection.query(
            sql, 
            //values, 
            function(err, result){
                if(err){
                    console.log(err)
                    state=false
                }else{
                    //스코어 등록 건수 만큼 반복
                    let hap = 0
                    let k=1
                    hap=hap+parseInt(result[0].strok)

                    //반복
                    for(var i =0; i<result.length-1;++i ){
                        if(result[i].phone==result[i+1].phone && result[i].golfsys==result[i+1].golfsys){
                            if(k<=5){
                                hap=hap+parseInt(result[i+1].strok)
                                ++k
                            }

                        }else{
                            console.log("update ksfc bestscore=",result[i].golfsys, result[i].phone, hap ) 
                            
                             // ksfc에 해당 레코드가 있으면 갱신 아니면 insert
                            const sql = `
                                select 
                                *
                                from 
                                ksfc5
                                where 
                                golfsys=? && phone=?
                                `
                            const values = [ result[i].golfsys, result[i].phone ]
                            connection.query(
                            sql, 
                            values, 
                            function(err, result2){
                            if(err){
                                console.log(err)
                                state=false
                            }else{
                                //레코드가 존재 update
                                console.log(result2)
                                if(result2.length!=0){
                                    const sql=
                                        `
                                        update
                                        ksfc5
                                        set
                                        bestscore=?
                                        where
                                        phone = ? && golfsys=?
                                        `
                                    const values = [hap,result[i].phone, result[i].golfsys]
                                    connection.query(
                                    sql,
                                    values,
                                    (err, result3)=>{
                                        if(err){   
                                            console.log(err)
                                        }else{
                                            
                                            console.log("rank 갱신완료", result3)
                                }})


                                }else{//레코드가 없으면 insert

                                    const sql4 = 
                                        `
                                        select 
                                        *
                                        from 
                                        user_info
                                        where 
                                        phone=?
                                        `
                                    const values4 = [ result[i].phone ]
                                    connection.query(
                                    sql4, 
                                    values4, 
                                    function(err, result4){
                                    if(err){
                                        console.log(err)
                                        state=false
                                    }else{
                                        _phone = result[i].phone
                                        _username =  result[i].username
                                        _gamenumber = 5
                                        _gender=result4[0].gender
                                        _jiyeok=result4[0].jiyeok
                                        _birth=result4[0].birth
                                        _golfsys=result[i].golfsys
                                        _bestscore=hap
                                        _sysrank=0
                                        _registtime= moment().format('YYYY-MM-DDTHH:mm:ss')
                                        ksfc_insert(_phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_sysrank, _registtime)
                                        
                                    }})     

                                }}})

                            hap=0
                            k=0
                        }
                    }//for
                }})

                // ksfc 석차 구하기
                const sql5 = `
                    select 
                    *
                    from 
                    ksfc5
                    order by gender, golfsys, bestscore ASC
                    `
                //const values5 = [_phone]
                connection.query(
                sql5, 
                //values5, 
                function(err, result5){
                if(err){
                    console.log(err)
                    state=false
                }else{
                    state=true
                    let len = result5.length//전체건수
                    console.log("len ksfc 총건수result =",len ) 

                    for(var i=0; i<len ; ++i){
                       
                        //phone번호로 로그인된 세션의 score만  
                        //나의 스코어순서로cd
                        const sql6 = `
                            select 
                            *
                            from 
                            ksfc5
                            where gender=? && golfsys=?
                            ORDER BY bestscore ASC
                            `
                        const values6 = [result5[i].gender, result5[i].golfsys ]
                        connection.query(
                        sql6, 
                        values6, 
                        function(err, result6){
                            if(err){
                                console.log(err)
                            }else{
                                    
                                let lensys=result6.length // 해당 성별, 시스템별 
                                console.log("lensys=",result6.length)
                                console.log("[result5[i].gender, result5[i].golfsys =",result5[i].gender, result5[i].golfsys)
                               
                                //console.log("result6[j].bestscore , result5[i].bestscore =",result6[j].bestscore , result5[i].bestscore ) 
                                
                                for(var j=0;j<lensys;j++){  
                                    console.log("i,j=",i,j)

                                   if(result6[j].bestscore == result5[i].bestscore){
                                      rank[i]=j+1
                                      console.log("석차 =",result6[j].bestscore , result5[i].bestscore, rank[i] ) 
                                        
                                        }
                                    }

                                console.log("update ksfc rank[j]=",j,rank[j],_phone,result2[j].golfsys )  
                                const sql7=
                                    `
                                    update
                                    ksfc5
                                    set
                                    sysrank=?
                                    where
                                    phone = ? && golfsys=?
                                    `
                                const values7 = [rank[i], result5[i].phone ,result5[i].golfsys]
                                
                                connection.query(
                                sql7,
                                values7,
                                (err, result7)=>{
                                    if(err){   
                                        console.log(err)
                                    }else{
                                        
                                        console.log("rank 갱신완료")
                                        }
                                })
                            }})
                        }

                        //나의 스코어순서로cd
                        const sql8 = `
                            select 
                            *
                            from 
                            ksfc5
                            where phone=?                           `                
                        const values8 = [_phone ]
                        connection.query(
                        sql8, 
                        values8, 
                        function(err, result8){
                            if(err){
                                console.log(err)
                            }else{

                                res.render('ksfc_list', {
                                    'resultt': result5,  //전체 bestscore순
                                    'resultt2': result8,//나의
                                    'username' : _user, 
                                    'phone': _phone,
                                    amount:_amount,
                                    'len': len,
                                    'state':state
                                })  

}})}})}})
                        


// stroke_rank
router.get('/ksfc_list1', async (req, res)=>{
    let rank=[]
    if(!req.session.logined){
        res.redirect("/")
    }else{    
        const phone=req.session.logined.phone
        console.log("ksfc  phone=", phone)
                                                                   
        // 유저가 입력한 데이터를 변수에 대입 
        const _gamenumber = await req.body.input_gamenumber 
        const _gender =await  req.body.input_gender 
        const _jiyeok =await  req.body.input_jiyeok 
        const _birth = await req.body.input_birth.trim()
        const _golfsys = await req.body.input_golfsys 

         // ksfc전체를 1등부터 순서대로 불러온다
         const sql = `
            select 
            *
            from 
            ksfc
            order by golfsys, bestscore ASC
            `
        //const values = [_phone]
        connection.query(
            sql, 
            //values, 
            function(err, result){
                if(err){
                    console.log(err)
                    state=false
                }else{
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
                            function(err, result5){
                                if(err){
                                    console.log(err)
                                }else{

                    //기골프시스템 구하지
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
                            function(err, result2){
                                if(err){
                                    console.log(err)
                                }else{
                                    let st=0
                                    for(var i=0;i<result2.length;++i){
                                    if(result2.golfsys==_golfsys){
                                        st=1
                                        break
                                    }}
                                    if(st==0){
                                        console.log("//같은 시스템이 아니니 등록")
                                        console.log("이거?",_gamenumber, _gender, _jiyeok, _birth ,_golfsys)

                                        const _username=result5[0].username
                                        const _bestscore = 9999
                                        const _registtime = moment().format('YYYY-MM-DDTHH:mm:ss')
                                        const _sysrank = 0
                                        console.log(phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_registtime)
                                        kpoint.ksfc_insert(phone, _username, _gamenumber, _gender, _jiyeok, _birth ,_golfsys ,_bestscore,_sysrank, _registtime)
                
                                        res.render("ksfc_list",{
                                            phone:phone,
                                            username:_username,
                                            amount:req.session.logined.charge_amount,
                                            'resultt': result,  //전체 bestscore순
                                            resultt2:result2//나의
                                        })                          
                                    }else{
                                        const _bestscore = result2[0].bestscore
                                        const _sysrank= result2[0].sysrank
                                        
                                        const _golfsys=golf_sys
                                        kpoint.ksfc_update((_bestscore, _sysrank, phone, _golfsys ) )
                                        console.log("회원정보 수정완료")
                                        res.render("ksfc_list",{
                                            phone:phone,
                                            username:_username,
                                            amount:req.session.logined.charge_amount,
                                            'resultt': result,  //전체 bestscore순
                                            'resultt2': result2//나의
                                        })                 
                                    }
                    }})}})
                }})
            }})
 
                        

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
                        


router.get('/enterscore',async function(req, res){
    if(!req.session.logined){
        let data=0
        res.redirect("/")
    }else{
                   
        data=1
    
        const no = req.query.no
        console.log("req.body.no",no)        
        const phone = req.session.logined.phone
        const user = req.session.logined.username
        
        //1. 대회참가비 리스트 result9
        const sql9 = `
            select 
            *
            from 
            score
            where 
            phone = ?
            order by entertime DESC
            `
        const values9 = [phone]
        connection.query(
        sql9, 
        values9, 
        function(err, result9){
            if(err){
                console.log(err)
                let data=0
            }else{
                console.log("//대회참가비 리스트result.length",result9.length )
            
                
            //2. score테이블 리스트 중 클릭을 한 리스트의 값 즉 시간 result
                const entertime11 = result9[no].entertime
                console.log("내가 선택한 시간은 entertime :  ",entertime11)
                console.log("내가 선택한 시간의 stroke :  ",result9[no].strok)

                console.log("선택한 시간 레코드를 추출" )
                //
                const sql = `
                    select 
                    * 
                    from 
                    score 
                    where 
                    entertime = ?
                        `
                    // const values =[phone]
                    const values = [entertime11]

                    connection.query(
                    sql, 
                    values, 
                    function(err, result){
                        if(err){
                            console.log(err)
                            res.send(err)
                        }else{
                            console.log("시간으로 찾은 레코드 :", result)
                            console.log('The 2st entertime is: ', result[0].entertime)
                            const entertime1 = result[0].entertime

                            //스코어입력시 참가시스템 확인
                            const sql2 = `
                                select 
                                * 
                                from 
                                ksfc
                                where 
                                phone = ?
                                    `
                                const values2 =[phone]
                                 
                                connection.query(
                                    sql, 
                                    values, 
                                    function(err, result2){
                                        if(err){
                                            console.log(err)
                                            res.send(err)
                                        }else{
                                            console.log(" result2 :",result2)



                            const gender=req.session.logined.gender
                            console.log(" KSFC성별 :",gender)
                            //성별이 존재하면 성별과 참가시간을 추출하여 렌더링
                            if(gender=="남"||gender=="여"){

                                console.log("5등 이내의 성적과 합과 스코어 등록을 할 레코드를 enterscore 포스트로 렌더링")

                                //만약 스코어카드가 이미 있으면 기 score내용은 수정 불가 하도록 조치
                                if(result[0].bestscore!= 9999){
                                    res.render('enterscore1', {
                                        no:no,
                                        resultt : result, 
                                        resultt2: result2,
                                        username:user,
                                        login_data : req.session.logined,
                                        timeresult:result[0],
                                        entertime : entertime1,
                                        state:data,
                                        gender:gender
                                    })
                                }else{
                                    res.render('enterscore', {
                                        no:no,
                                        resultt : result, 
                                        resultt2: result2,
                                        username:user,
                                        login_data : req.session.logined,
                                        timeresult:result[0],
                                        entertime : entertime1,
                                        state:data,
                                        gender:gender
                                })}
                                            }
                                        }})}})
    }})}})


                    
router.post('/enterscore',async function(req, res){
    if(!req.session.logined){
        res.redirect("/")
    }else{
        let gender=""
        const n = req.body._n.trim()   
        console.log("-------------req.body.n11?",n)
        
        const sysrank=0
        const phone = req.session.logined.phone 
        console.log("req.session.logined.phone= ",phone)
        const user = req.session.logined.username
        console.log("req.session.logined.username= ",user)
        const _golfsys =  req.body.input_golfsys.trim()
        console.log("-------------input_golfsys?",_golfsys)
        const stroke =  req.body.input_strok.trim() 
        console.log("-------------input_strok?",stroke)

        //결제2000Kpoint 계산
        const _tokenamount = req.session.logined.charge_amount
        const tokenamount = parseInt(_tokenamount)+parseInt(-2000)  

//스코어카드 파일 기록
        // console.log("-------------req.file.filename?",req.file.filename)

        // const _scorepicture = req.file.filename
        
        // console.log('_scorepicture=',_scorepicture);

        // const code = Math.floor(Math.random() * 10000000)
        // console.log("파일이름 중복방지 =",code)
        // const filename = code.toString()+_scorepicture; 
                
        // Save the file to the filesystem. 
        
        // Check if the file exists
        // filepath ="/uploads/"+_scorepicture
        //     console.log("filepath = ",filepath)
            // const image = fs.readFileSync(filepath)
//             // If the file exists, write it to the filesystem
//             if (!fs.existsSync(filepath)) {
//                 // fs.writeFile(filepath,JSON.stringify(filepath), (err) => {
//                     fs.writeFile(filepath,image, (err) => {
//                     if (err) {
//                         console.log(err);
//                         res.send(err);
//                     } else {
//                         console.log('File saved successfully!');
//                     }
//                 })
//             } else {
//                 console.log('File does not exist!');
//             }}


// 나의 score_list 
        const sql2 = `
            select 
            *
            from 
            score
            where 
            phone = ?
            order by entertime DESC
            `
            const values2 = [phone]
            connection.query(
                sql2, 
                values2, 
                function(err, result2){
                    if(err){
                        console.log(err)
                    }else{
                        console.log("result2   미리보기=",result2.length )

//리스트에서 선택 한 것과 똑 같은 위치의 결제시간획득해서 score에 갱신등록
                        const entertime =result2[n].entertime

                        console.log("entertime과 갱신내용 미리보기=", entertime, stroke )
                        const _scorepicture=""
                        // enterscore_update
                        kpoint.enterscore_update(_golfsys, stroke,_scorepicture, entertime)
                        
//kpoint list 거래 전체 기록테이블에 추가 
                        const trans_tp = "festival"
                        const price ='2000'
                        const enterdate = moment().format('YYYY-MM-DDTHH:mm:ss')
                        kpoint.kpoint_list_insert(phone, trans_tp,  enterdate, price, tokenamount )


                        const sql2 = `
                            select 
                            *
                            from 
                            score
                            where 
                            phone = ? && golfsys = ? 
                            order by strok ASC
                            `
                        const values2 = [phone, _golfsys]
                        connection.query(
                            sql2, 
                            values2, 
                            function(err, result4){
                                if(err){
                                    console.log(err)
                                }else{
                                    
                                    console.log("//상위 5개 score출력을 위한 준비: ", result4.length)

//나의 같은 골프 시스템, 같은성별,5위까지의 합    
                                    let len=0
                                    let sco_sum =0
                                    
                                    if(result4.length > 5){
                                        len =5
                                    }else{
                                        len = result4.length
                                    }
                                    if(len>0){
                                        data=1
                                    }
                                    console.log("len : ", len)
                                    
                                    for(var i=0; i<len; i++){
                                        //스코어가 갱신 안된것은 제외
                                        if(result4[i].strok!='9999'){
                                        sco_sum = sco_sum + parseInt(result4[i].strok)
                                        console.log("strok, sco_sum = ", result4[i].strok, sco_sum )
                                        }
                                    }
                                    console.log("scores_sum=", sco_sum)
                                    const scores_sum = sco_sum.toString()

//ksfc 5위내의 점수(베스트스코어)와 등수  ksfc에 입력(tier을 위해)
                                                         
                                    for(var i=0; i<result2.length; i++){
                                        if(scores_sum==result2[i].bestscore){
                                            sysrank=i+1
                                            break
                                        }
                                    }
                                    console.log("ksfc_update=", scores_sum, sysrank, phone, _golfsys)
                                    kpoint.ksfc_update(scores_sum, sysrank, phone, _golfsys ) 

//log_info에 tier 갱신
                                    const gender  = req.session.logined.gender  
                                    console.log("tier_update=", phone,gender)      
                                    kpoint.tier_update(phone,gender)
                                    
                                    res.render('score_list', {
                                            'resultt':result2,
                                            'username' : user, 
                                            'phone': phone,
                                            'amount' : tokenamount,
                                            'login_data' : req.session.logined,  
                                            'scores_sum' : scores_sum,
                                            'state':data,
                                            'len': len,
                                            gender:gender             
                                            })  

                                }})}
                            })}})


 
    router.get('/enterscore1',async function(req, res){
        if(!req.session.logined){
            let data=0
            res.redirect("/")
        }else{
                        
            data=1
            const phone = req.query.phone 
            const user = req.query.user
             const no = req.query.no
            console.log("req.body.no",no)        
            console.log("//리스트 중 몇번째?를 선택했는지 전달받은 매개변수", no,phone,user)
           
            
            //1. 대회참가비 리스트 result9
            const sql9 = `
                select 
                *
                from 
                score
                where 
                phone = ?
                order by entertime DESC
                `
            const values9 = [phone]
            connection.query(
            sql9, 
            values9, 
            function(err, result9){
                if(err){
                    console.log(err)
                    let data=0
                }else{
                    console.log("//대회참가비 리스트result.length",result9.length )
                
                    
                //2. score테이블 리스트 중 클릭을 한 리스트의 값 즉 시간 result
                    const entertime11 = result9[no].entertime
                    console.log("내가 선택한 시간은 entertime :  ",entertime11)
                    console.log("내가 선택한 시간의 stroke :  ",result9[no].strok)
    
                    console.log("선택한 시간 레코드를 추출" )
                    //
                    const sql = `
                        select 
                        * 
                        from 
                        score 
                        where 
                        entertime = ?
                            `
                        // const values =[phone]
                        const values = [entertime11]
    
                        connection.query(
                            sql, 
                            values, 
                            function(err, result){
                                if(err){
                                    console.log(err)
                                    res.send(err)
                                }else{
                                    console.log("시간으로 찾은 레코드 :", result)
                                    console.log('The 2st entertime is: ', result[0].entertime)
                                    const entertime1 = result[0].entertime
                    
            // ksfc에서 성별 가져오기  result2
                                    const sql2 = `
                                        select 
                                        * 
                                        from 
                                        ksfc 
                                        where 
                                        phone = ?
                                            `
                                    const values2 = [phone]
    
                                    connection.query(
                                        sql2, 
                                        values2, 
                                        function(err, result2){
                                            if(err){
                                                console.log(err)
                                                res.send(err)
                                            }else{
                                                    console.log("KSFC성별 추출이 하고 싶어서",result2)
                                                    const gender=result2[0].gender
                                                    console.log("KSFC성별 :",gender)
                                                    //성별이 존재하면 성별과 참가시간을 추출하여 렌더링
                                                    if(gender=="남"||gender=="여"){
    
                                                        console.log("5등 이내의 성적과 합과 스코어 등록을 할 레코드를 enterscore 포스트로 렌더링")
    
                                                        //만약 스코어카드가 이미 있으면 기 score내용은 수정 불가 하도록 조치
                                                        if(result[0].scorepicture!=""){
                                                            res.render(' enterscore1', {
                                                                no:no,
                                                                resultt : result, 
                                                                resultt2: result2,
                                                                username:user,
                                                                phone:phone,
                                                                login_data : req.session.logined,
                                                                timeresult:result[0],
                                                                entertime : entertime1,
                                                                state:data,
                                                                gender:gender
                                                            })
                                                        }else{
                                                            res.render('enterscore1', {
                                                                no:no,
                                                                resultt : result, 
                                                                resultt2: result2,
                                                                username:user,
                                                                phone:phone,
                                                                login_data : req.session.logined,
                                                                timeresult:result[0],
                                                                entertime : entertime1,
                                                                state:data,
                                                                gender:gender
                                                        })}
                                                    }
                                                }})}})
                                    }}
                        )}})
    
    router.post('/enterscore1', async function(req, res){
        if(!req.session.logined){
            res.redirect("/")
        }else{
            let gender=""
            const n = req.body._n   
            const sysrank=0
            const phone = req.session.logined.phone 
            const user = req.session.logined.username
            const _golfsys = await req.body.input_golfsys
            console.log("-------------input_golfsys?",_golfsys)
            const stroke = await req.body.input_strok  
            console.log("-------------input_strok?",stroke)
    
            //결제2000Kpoint 계산
            const _tokenamount = req.session.logined.charge_amount
            const tokenamount = parseInt(_tokenamount)+parseInt(-2000)  
    
    //스코어카드 파일 기록
            const _scorepicture = req.file.filename
            console.log('_scorepicture=',_scorepicture);
    
            // const code = Math.floor(Math.random() * 10000000)
            // console.log("파일이름 중복방지 =",code)
            // const filename = code.toString()+_scorepicture; 
                    
            // Save the file to the filesystem. 
            
            // Check if the file exists
            // filepath ="/uploads/"+_scorepicture
            //     console.log("filepath = ",filepath)
                // const image = fs.readFileSync(filepath)
    //             // If the file exists, write it to the filesystem
    //             if (!fs.existsSync(filepath)) {
    //                 // fs.writeFile(filepath,JSON.stringify(filepath), (err) => {
    //                     fs.writeFile(filepath,image, (err) => {
    //                     if (err) {
    //                         console.log(err);
    //                         res.send(err);
    //                     } else {
    //                         console.log('File saved successfully!');
    //                     }
    //                 })
    //             } else {
    //                 console.log('File does not exist!');
    //             }}

            const sql2 = `
                select 
                *
                from 
                score
                where 
                phone = ?
                order by entertime DESC
                `
                const values2 = [phone]
                connection.query(
                    sql2, 
                    values2, 
                    function(err, result2){
                        if(err){
                            console.log(err)
                        }else{
                            console.log("result2   미리보기=",result2.length )
    
    //리스트에서 선택 한 것과 똑 같은 위치의 결제시간획득해서 score에 갱신등록
                            const entertime =result2[n].entertime
    
                            console.log("entertime과 갱신내용 미리보기=", entertime, stroke )
                            // const _scorepicture=""
                            //enterscore_update
                            kpoint.enterscore_update(_golfsys, stroke,_scorepicture, entertime)
                            
    //kpoint list 거래 전체 기록테이블에 추가 
                            const trans_tp = "festival"
                            const price ='2000'
                            const enterdate = moment().format('YYYY-MM-DDTHH:mm:ss')
                            kpoint.kpoint_list_insert(phone, trans_tp,  enterdate, price )
    
    //성별을 얻기 위해
                            const sql2 = `
                                select 
                                *
                                from 
                                ksfc
                                where 
                                phone = ?  
                                `
                            const values2 = [phone]
                            connection.query(
                                sql2, 
                                values2, 
                                function(err, result2){
                                    if(err){
                                        console.log(err)
                                        }else{
                                                    const ggender=result2[0].gender
                                                console.log("젠더가 구해지나??",ggender )
                                                
    
    //나의 같은 골프 시스템, 스코어 순 내림차순 정열 5등 안의 score 준비+ 합계구하기
                                                const sql2 = `
                                                    select 
                                                    *
                                                    from 
                                                    score
                                                    where 
                                                    phone = ? && golfsys = ? 
                                                    order by strok ASC
                                                    `
                                                const values2 = [phone, _golfsys]
                                                connection.query(
                                                    sql2, 
                                                    values2, 
                                                    function(err, result2){
                                                        if(err){
                                                            console.log(err)
                                                        }else{
                                                            
                                                            console.log(result2.length)
                                                            console.log("//상위 5개 score출력을 위한 준비: ", result2.length)
            
    //나의 같은 골프 시스템, 같은성별,5위까지의 합    
                                                            let len=0
                                                            let sco_sum =0
                                                            
                                                            if(result2.length > 5){
                                                                len =5
                                                            }else{
                                                                len = result2.length
                                                            }
                                                            if(len>0){
                                                                data=1
                                                            }
                                                            console.log("len : ", len)
                                                            
                                                            for(var i=0; i<len; i++){
                                                                //스코어가 갱신 안된것은 제외
                                                                if(result2[i].strok!='9999'){
                                                                sco_sum = sco_sum + parseInt(result2[i].strok)
                                                                console.log("strok, sco_sum = ", result2[i].strok, sco_sum )
                                                                }
                                                            }
                                                            console.log("scores_sum=", sco_sum)
                                                            const scores_sum = sco_sum.toString()
    
    //ksfc 5위내의 점수(베스트스코어)와 등수  ksfc에 입력(tier을 위해)
                                                            for(var i=0; i<result2.length; i++){
                                                                if(scores_sum==result2[i].bestscore){
                                                                    sysrank=i+1
                                                                    break
                                                                }
                                                            }
    
                                                            kpoint.ksfc_update(scores_sum, sysrank, phone, _golfsys ) 
    
    //log_info에 tier 갱신
                                                            kpoint.tier_update(phone,gender)
                                                            // res.redirect("/score_list")
                                                            res.render('score_list', {
                                                                    'resultt':result2,
                                                                    'username' : user, 
                                                                    'phone': phone,
                                                                    'amount' : tokenamount,
                                                                    'login_data' : req.session.logined,  
                                                                    'scores_sum' : scores_sum,
                                                                    'state':data,
                                                                    'len': len           
                                                                    })  
    
                                                            }})}
                                })}}) }}) 



router.get('/notice', function(req, res){
    res.render("notice")
})

router.get('/notice_refferal', function(req, res){
    res.render("notice_refferal")
})

router.get('/ksfaga', function(req, res){
    console.log("ksfaga 페이지 보이기")
    res.render("ksfaga")
})

router.get('/regu', function(req, res){
    console.log("대회규정 보여주기")
    res.render("regu")
})

router.get('/trophy', function(req, res){
    console.log("상금관련 페이지 보여주기")
    res.render("trophy")
})

router.get('/bkecho', function(req, res){
    res.render("bkecho")
})

router.get('/onlyholein', function(req, res){
    res.render("onlyholein")
})

router.get('/holeinlist', function(req, res){
    res.render("holeinlist")
})

// return이 되는 변수는 router
    return router
}