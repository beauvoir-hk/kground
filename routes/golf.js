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
        const _gamenumber = await req.body.input_gamenumber.trim()
        const _gender =await  req.body.input_gender.trim()
        const _jiyeok =await  req.body.input_jiyeok.trim()
        const _birth = await req.body.input_birth.trim()
        const _golfsys = await req.body.input_golfsys.trim()

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
                        const _gamenumber = req.body.input_gamenumber.trim()
                        const _gender =req.body.input_gender.trim()
                        const _jiyeok =req.body.input_jiyeok.trim()
                        const _birth = req.body.input_birth.trim()


                        const add_golfsys = req.body.input_golfsys.trim()

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
                
        //ksfc에서 성별 가져오기  result2
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
                                                console.log(" KSFC성별 추출이 하고 싶어서",result2)
                                                const gender=result2[0].gender
                                                console.log(" KSFC성별 :",gender)
                                                //성별이 존재하면 성별과 참가시간을 추출하여 렌더링
                                                if(gender=="남"||gender=="여"){

                                                    console.log("5등 이내의 성적과 합과 스코어 등록을 할 레코드를 enterscore 포스트로 렌더링")

                                                    //만약 스코어카드가 이미 있으면 기 score내용은 수정 불가 하도록 조치
                                                    if(result[0].scorepicture!=""){
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
                                }}
                    )}})

                    
router.post('/enterscore',async function(req, res){
    if(!req.session.logined){
        res.redirect("/")
    }else{
        let gender=""
        const n = req.body._n.trim()   
        console.log("-------------req.body.n11?",n)
        
        let sysrank=0
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
    
// const fs = require('fs');
// const path = require('path');

// const uploadImage = (req, res) => {
    // Check if the file was uploaded successfully
//   if (req.files && req.files.image && req.files.image.name) {

    // Get the file name
    // const filename = req.files.image.name;

    // Move the file to the uploaded images directory
    // const destinationPath = path.join(__dirname, 'uploads', filename);

    // console.log("destinationPath=",destinationPath)
    // fs.move(req.files.image.path, filepath , (err) => {
    //   if (err) {
    //     res.status(500).send(err);
    //   } else {
    //     res.status(200).send('The image was uploaded successfully!');
    //   }
    // });

//   } else {
//     res.status(400).send('There was an error uploading the image.');
//   }
// };

    
// const ssh2 = require('ssh2');

// const client = new ssh2.Client();
// client.connect('34.22.89.71', 22, 'tohkpark', 'scrn*1000');

//             // Create a new SFTP session
//             const sftp = client.sftp();

//             // Upload a file
//             sftp.put('filepath', 'filepath');

//             // Download a file
//             sftp.get('filepath', 'filepath');

//             // Close the connection
//             client.close();

// score_list result2
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


 
                            router.get('/enterscore1',async function(req, res){
                                if(!req.session.logined){
                                    res.redirect("/")
                                }else{
                                    let gender=""
                                    const n = req.body._n.trim()   
                                    let sysrank=0
                                    const phone = req.session.logined.phone 
                                    const user = req.session.logined.username
                                    const _golfsys = await req.body.input_golfsys.trim()
                                    console.log("-------------input_golfsys?",_golfsys)
                                    const stroke = await req.body.input_strok.trim()  
                                    console.log("-------------input_strok?",stroke)
                            
                                    //결제2000Kpoint 계산
                                    const _tokenamount = req.session.logined.charge_amount
                                    const tokenamount = parseInt(_tokenamount)+parseInt(-2000)  
                            
                            //스코어카드 파일 기록
                                    console.log("-------------req.file.filename?",req.file.filename)
                            
                                    const _scorepicture = req.file.filename
                                    
                                    console.log('_scorepicture=',_scorepicture);
                            
                                    // const code = Math.floor(Math.random() * 10000000)
                                    // console.log("파일이름 중복방지 =",code)
                                    // const filename = code.toString()+_scorepicture; 
                                            
                                    // Save the file to the filesystem. 
                                    
                                    // Check if the file exists
                                    filepath ="/uploads/"+_scorepicture
                                        console.log("filepath = ",filepath)
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
                                
                            // const fs = require('fs');
                            // const path = require('path');
                            
                            // const uploadImage = (req, res) => {
                                // Check if the file was uploaded successfully
                            //   if (req.files && req.files.image && req.files.image.name) {
                            
                                // Get the file name
                                // const filename = req.files.image.name;
                            
                                // Move the file to the uploaded images directory
                                // const destinationPath = path.join(__dirname, 'uploads', filename);
                            
                                // console.log("destinationPath=",destinationPath)
                                // fs.move(req.files.image.path, filepath , (err) => {
                                //   if (err) {
                                //     res.status(500).send(err);
                                //   } else {
                                //     res.status(200).send('The image was uploaded successfully!');
                                //   }
                                // });
                            
                            //   } else {
                            //     res.status(400).send('There was an error uploading the image.');
                            //   }
                            // };
                            
                                
                            // const ssh2 = require('ssh2');
                            
                            // const client = new ssh2.Client();
                            // client.connect('34.22.89.71', 22, 'tohkpark', 'scrn*1000');
                            
                            //             // Create a new SFTP session
                            //             const sftp = client.sftp();
                            
                            //             // Upload a file
                            //             sftp.put('filepath', 'filepath');
                            
                            //             // Download a file
                            //             sftp.get('filepath', 'filepath');
                            
                            //             // Close the connection
                            //             client.close();
                            
                            //score_list result2
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
                                                    
                                                    // enterscore_update
                                                    kpoint.enterscore_update(_golfsys, stroke,_scorepicture, entertime)
                                                    
                            //kpoint list 거래 전체 기록테이블에 추가 
                                                    const trans_tp = "festival"
                                                    const price ='2000'
                                                    const enterdate = moment().format('YYYY-MM-DDTHH:mm:ss')
                                                    kpoint.kpoint_list_insert(phone, trans_tp,  enterdate, price,tokenamount )
                            
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



// return이 되는 변수는 router
    return router
}