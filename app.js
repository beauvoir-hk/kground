// express 로드
const express = require('express')
var req = require('request') 
const app = express()
const port = 3000
const https = require('https');
const res = require('express').response
const fs = require('fs');
const web3 = require("web3");
const moment = require('moment')

//현재 파일의 경로
app.set('views', __dirname+'/views')
app.set('view engine', 'ejs')
//외부 js,css,img등의 파일들의 기본경로
app.use(express.static('public'))


//데이터를 post형식으로 받을때 json의 형태로 변환 
app.use(express.urlencoded({extended:false}))
const router = express.Router()

// 환경변수설정 dotenv 
require('dotenv').config()

// express-session 모듈을 로드
//로그인 같은 로그인에 대한 정보저장
//임시파일 사용, 수명을 주어 시간이 지나면 파일의 정보를 삭제 
// 임시파일은 유저가 가지고 있다
// mysql server 정보를 입력
const session = require('express-session')
// session 설정
app.use(
    session(
        {
            secret : process.env.secret_key, 
            resave : false, 
            saveUninitialized : false, 
            cookie : {
                maxAge : 60000000000000// 1000당 1초(즉 1분)
            }
        }
    )
)
// Twilio에 연결합니다
const twilioClient = require('twilio')(process.env.accountSid, process.env.authToken)
const kpoint = require("./token/kpoint")
// api들을 생성
// localhost:3000/ 요청시 
app.get('/', async function(req, res){
    // 해당하는 주소로 요청이 들어온 경우
    // req.session 안에 로그인의 정보가 존재하지 않는다면
    // 로그인 화면을 보여주고
    // 존재한다면 index으로 이동

   // 세션에 로그인 정보가 존재하지 않는다면
   let data = 0
    if(!req.session.logined){

        console.log(data, '세션정보가 없음')

        console.log(req.query.data)
        if(req.query.data){
            data = req.body.data.trim()
        }else{
            data=1
        }
        
        res.render('login', {
           'state' : data
            })
    }else{
        res.render('index.ejs', {
            'login_data': req.session.logined,
            'amount' : req.session.logined.charge_amount,
        })
}})


    app.get("/index", function(req, res){
        // session 존재 유무에 따른 조건식 생성
        if(!req.session.login){
            res.redirect("/")
        }else{
            res.render('index.ejs', {
                'login_data': req.session.logined,
                'amount' : req.session.logined.charge_amount,
           
            })
        }
    })

    app.get("/auth", function(req, res){
        console.log("app의 get실행 로그인")
        // session 존재 유무에 따른 조건식 생성
        // console.log("app의 get실행")
        if(req.session.login){
            res.redirect("/my")
        }else{
            console.log("app의 get실행 로그인안됨")
            res.render('auth')
        }
    })

//충전하기(유저의 지갑에 금액만큼 충전)
app.post('/payment', async function(req, res){
     
        // 유저가 결재한 금액과 폰번호
        const price = req.query.price
        const phone= req.query.phone

        console.log(" 유저가 결재한 금액   price=", price)   
         
        if(req.method == 'POST'){
            if(req.body.pay_state.trim()!=4){
                switch (req.body.pay_state.trim()){
                    case 1:
                        console.log("요청만 되었고 완료가 안됨 ")
                        break
                    case 8:
                    case 16:
                    case 32:
                        console.log("요청취소 ")
                        break
                    case 9:
                    case 64:
                        console.log("승인취소 ")
                    default:
                        break
                    }
                }else{

                    console.log("승인 완료 ")
                    // if(!req.session.logined){
                        // console.log("login again",__dirname)
                        console.log("현재 path",__dirname)
                        // res.redirect("..")

                    // }else{
                        // const phone =  req.session.logined.phone
                        
                        //충전자에게 안내 메세지
                        const gphone = "+82"+ phone
                        console.log("충전한 사람 폰 =",gphone)
                        
                        twilioClient.messages.create({
                            body: '케이그라운드와 함께 해주셔서 감사합니다. 충전완료:    ' +  price ,
                            from: process.env.kphonenumber,
                            to: gphone
                            })
                            .then(message => console.log("charge ment ok(kground)----", gphone,message.sid))

                        

                        //본사에 충전메세지
                        const ggphone = "+8201025961010" 
                        console.log(" 본사 폰  =",ggphone)
                        // 문자인증 코드를 생성합니다.
                        // 랜덤으로 4자리 인증 코드를 만든다.
                        
                        console.log("process.env.kphonenumber=",process.env.kphonenumber)
                
                        twilioClient.messages.create({
                            body: '케이그라운드 충전완료(페이앱):   ' +  price ,
                            from: process.env.kphonenumber,
                            to: ggphone
                            })
                            .then(message => console.log("charge ment ok(----",ggphone, message.sid))
                            
                                               
                        const chargedate = moment().format('YYYY-MM-DDTHH:mm:ss')
                        console.log("charge date :",chargedate )

                        
                        //충전 리스트에 추가기록
                        kpoint.chargelist_insert(phone,chargedate, price)
                                               
                        //원장기록 update
                        kpoint.log_info_amount_update(phone,price )
                       

                        //kpoint 전체거래내역에 추가
                        const trans_tp="charge"
                        kpoint.kpoint_list_insert(phone, trans_tp,  chargedate, price )

                        const trans_tp1="event"
                        kpoint.kpoint_list_event_insert(phone, trans_tp1,  chargedate,  price )
                        
                        const trans_tp2="refferal"
                        kpoint.kpoint_list_refferal_insert(phone, trans_tp2, chargedate, price )
                        console.log("현재 경로",__dirname)
                        res.redirect("..") 
                    }     

        }}
    )

// 파일 로드 
// () : module.exports가 function의 형태
// 특정 주소로 요청이 들어왔을때는 해당하는 js 파일을 사용
    const user = require('./routes/user.js')()
    app.use("/", user)

    const golf = require("./routes/golf.js")()
    app.use("/golf", golf)

    const contract = require('./routes/contract.js')()
    app.use("/contract", contract)

    const admin = require('./routes/admin.js')()
    app.use("/admin", admin)


    // 서버 시작 
    app.listen(port, () => {
        console.log(`Example app listening at http://kground.co.kr:${port}`)
    })



