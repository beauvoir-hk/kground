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

            //log_info의 통계
            const sql2 = `
                select 
                * 
                from 
                log_info 
                `
            connection.query(
                sql2, 
            function(err, result2){
                if(err){
                    console.log(err)
                    res.send(err)
                }else{
                    const tot_count = result2.length
                    // const tot_charge=''
                    let tot_char = 0
                    for(var i=0;i<tot_count; ++i){
                        tot_char = tot_char+result2[i].charge_amount
                    }
                    const tot_charge = tot_char.toString()

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
                            // const tot_charge_charge=''
                            let tot_char = 0
                            for(var i=0;i<tot_charge_count; ++i){
                                tot_char = tot_char+result3[i].transamount
                            }
                            const tot_charge_charge = tot_char.toString()

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
                                    // const tot_deposit=''
                                    let tot_char = 0
                                    for(var i=0;i<tot_deposit_count; ++i){
                                        tot_char = tot_char+result4[i].kp_amount
                                    }
                                    const tot_deposit = tot_char.toString()

                                    res.render('admin_index.ejs', {
                                        'login_data': req.session.logined ,
                                        total_count:tot_count,
                                        total_charge:tot_charge,
                                        total_charge_count:tot_charge_count,
                                        total_charge_charge:tot_charge_charge,
                                        tot_deposit_count:tot_deposit_count,
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
        //관리자
        const memo_admin = req.session.logined.username

        // 유저가 보낸 데이터를 서버에서 대소로 대입

        const _nickname =   req.body.input_nickname
        const _refferal =   req.body.input_refferal

        const _amount =  parseInt(req.body.input_amount)
        const _tier =   req.body.input_tier
        const _memo =   req.body.input_memo
        const _phone =   req.body.input_phone
        const _username =  req.body.input_username
        
        
        const _memotime = moment().format('YYYY-MM-DDTHH:mm:ss')

        kpoint.log_info_update( _nickname,_refferal,  _amount,  _tier, _phone)
        console.log('관리자 정보 갱신 완료 되었어요')

        kpoint.log_info_insert_memo(_phone,_username, _memo, _memotime, memo_admin)
        console.log('관리자 메모 정보 갱신 완료 되었어요')
        const sql2 = `
            select 
            * 
            from 
            log_info 
            where
            username=? || phone=?
            `
        const values2 =[_username, _phone ]   

        connection.query(
            sql2, 
            values2,
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                res.render("db_update",{
                    'login_data': req.session.logined ,
                    resultt:result2
                } )
            }
    })
        
    }})

    router.get('/admin_ok', function(req, res){
        if(!req.session.logined){
            console.log('로그인정보가 없음')
            res.redirect("/")
        }else{
            console.log('관리자 모드 로그인 되었어요')
           
                    res.render("admin_ok",{
                        'login_data': req.session.logined ,
                        // resultt:result2
                    } )
                }
    })
   
    

   
router.post('/admin_ok', async function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
       
        //입력 받기(전번 or 성명)
        const user_phone = await req.body.input_phone
        const user_name = await req.body.input_username
        console.log("admin_ok' ", user_phone,user_name)
        //log_info의 통계
        const sql2 = `
            select 
            * 
            from 
            log_info 
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
                console.log("admin_ok's 렌더링해주는 result2=", result2)
                res.render("db_update",{
                    'login_data': req.session.logined ,
                    resultt:result2,
                    user_name:user_name, 
                    user_phone:user_phone
                } )
            }
        })
    }})


//score_update
router.get('/admin_scoreupdate', function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
      

}})


router.post('/admin_scoreupdate', async function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
        //관리자
        const memo_admin = req.session.logined.username

        // 유저가 보낸 데이터를 서버에서 대소로 대입

        const _nickname =   req.body.input_nickname
        const _refferal =   req.body.input_refferal

        const _amount =  parseInt(req.body.input_amount)
        const _tier =   req.body.input_tier
        const _memo =   req.body.input_memo
        const _phone =   req.body.input_phone
        const _username =  req.body.input_username
        
        
        const _memotime = moment().format('YYYY-MM-DDTHH:mm:ss')

        kpoint.log_info_update( _nickname,_refferal,  _amount,  _tier, _phone)
        console.log('관리자 정보 갱신 완료 되었어요')

        kpoint.log_info_insert_memo(_phone,_username, _memo, _memotime, memo_admin)
        console.log('관리자 메모 정보 갱신 완료 되었어요')
        const sql2 = `
            select 
            * 
            from 
            log_info 
            where
            username=? || phone=?
            `
        const values2 =[_username, _phone ]   

        connection.query(
            sql2, 
            values2,
        function(err, result2){
            if(err){
                console.log(err)
                res.send(err)
            }else{
                res.render("/admin_scoreupdate",{
                    'login_data': req.session.logined ,
                    resultt:result2
                } )
            }
    })
        
    }})



//관리자 스코어수정
router.get('/admin_scoreok', function(req, res){
    if(!req.session.logined){
        console.log('로그인정보가 없음')
        res.redirect("/")
    }else{
        console.log('관리자 모드 로그인 되었어요')
                res.render("admin_scoreok",{
                    'login_data': req.session.logined ,
                } )
            }
})




router.post('/admin_scoreok', async function(req, res){
if(!req.session.logined){
    console.log('로그인정보가 없음')
    res.redirect("/")
}else{
    console.log('관리자 모드 로그인 되었어요')
   
    //입력 받기(전번 or 성명)
    const user_phone = await req.body.input_phone
    const user_name = await req.body.input_username
    console.log("admin_ok' ", user_phone,user_name)
    //log_info의 통계
    const sql2 = `
        select 
        * 
        from 
        score
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
            const _user_name=result2[0].username
            const _user_phone=result2[0].phone
            console.log("admin_score ok's 렌더링해주는 result2=", result2)
            res.render("admin_enterpay_list",{
                'login_data': req.session.logined ,
                enterpay:result2,
                username:_user_name, 
                phone:_user_phone
            } )
        }
    })
}})

router.get('/admin_enterpay_list', async (req, res)=>{
    if(!req.session.logined){
        res.redirect("/")
        let data =0
    }else{ 
        data=1 
          
        const phone = req.body._phone 
        const user = req.body._username   
        console.log("//////admin_enterpay_list=",phone,user )

        //대회참가비 결제 리스트
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
                
            }else{
               
                //스코어가 하나도 없는 경우는
                console.log("//대회참가비 리스트result.length",result.length)
                if(result.length==0){
                    const st=1
                    //스코어가 하나도 없어서 
                    res.render("enterpay",{
                        state:0,
                         
                        phone:phone,
                        username:user
                        }) 
                    }else{

                 //참가시스템 검색
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
                                    console.log("result2",result2)
                                    res.render('admin_enterpay_list', {
                                        ksfcres:result2,
                                        enterpay:result, 
                                        username : user, 
                                        
                                        phone: phone,
                                        login_data : req.session.logined,  
                    
                                    })}
                })}}})}})


    router.get('/admin_enterscore',async function(req, res){
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
                                                            res.render('admin_enterscore_1', {
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
                                                            res.render('admin_enterscore_1', {
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


router.post('/admin_enterscore', upload.single('_image'),async function(req, res){
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
                        //enterscore_update
                        kpoint.enterscore_update(_golfsys, stroke,_scorepicture, entertime)
                        
//kpoint list 거래 전체 기록테이블에 추가 
                        const trans_tp = "festival"
                        const price ='2000'
                        const enterdate = moment().format('YYYY-MM-DDTHH:mm:ss')
                        kpoint.kpoint_list_insert(phone, trans_tp,  enterdate, price, tokenamount )

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
                            function(err, result3){
                                if(err){
                                    console.log(err)
                                    }else{
                                        const gender = req.session.logined.gender
                                        console.log("젠더가 ??",gender )
                                            

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
                                                        console.log("ksfc_update = ",scores_sum, sysrank, phone, _golfsys )
                                                        kpoint.ksfc_update(scores_sum, sysrank, phone, _golfsys ) 

//log_info에 tier 갱신 
                                                        console.log("tier_update = ",phone,gender)
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
                                                                'len': len , 
                                                                gender:gender         
                                                                })  

                                                        }})}
})}}) }})   


router.get('/admin_enterscore_1',async function(req, res){
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
                                                        res.render('admin_enterscore_1', {
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
                                                        res.render('admin_enterscore_1', {
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



router.post('/admin_enterscore_1', upload.single('_image'),async function(req, res){
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
    
                            console.log("entertime과 갱신내용 미리보기=", entertime, stroke,_scorepicture )
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
                                                            console.log("ksfc_update=", scores_sum, sysrank, phone, _golfsys)
                                                            kpoint.ksfc_update(scores_sum, sysrank, phone, _golfsys ) 
    
    //log_info에 tier 갱신      
                                                            const gender  = req.session.logined.gender  
                                                            console.log("tier_update=", phone,gender)  
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
                                                                    'len': len ,  
                                                                    gender:gender         
                                                                    })  
    
                                                            }})}
                                })}}) }}) 



return router

}