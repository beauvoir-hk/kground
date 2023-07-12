// express 로드
const express = require('express')
var request = require('request') 
const app = express()
const port = 5000
//현재 파일의 경로

// const twilio = require('twilio')

app.set('views', __dirname+'/views')
app.set('view engine', 'ejs')
//외부 js,css,img등의 파일들의 기본경로
app.use(express.static('public'))

//데이터를 post형식으로 받을때 json의 형태로 변환 
app.use(express.urlencoded({extended:false}))
const router = express.Router()

// 환경변수설정 dotenv 
//민감한 주소를 공유에서 제외가능
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
                maxAge : 60000000000000000000000// 1000당 1초(즉 1분)
            }
        }
    )
)
const token = require("./token/token")
// api들을 생성
// localhost:3000/ 요청시 
app.get('/', async function(req, res){
    // 해당하는 주소로 요청이 들어온 경우 
    // req.session 안에 로그인의 정보가 존재하지 않는다면 
    // 로그인 화면을 보여주고 
    // 존재한다면 index으로 이동

    // 세션에 로그인 정보가 존재하지 않는다면
    if(!req.session.logined){
        let data = 0
        console.log(data, '세션정보가 없음')
        console.log(req.query.data)
        if(req.query.data){
             data = 1
        }
        res.render('login', {
            'state' : data
        })
    }else{
        const wallet = req.session.logined.wallet
        const amount = await token.balance_of(wallet)
        console.log(wallet, amount,"로그인 되었어요--인덱스로")
        res.render('index.ejs', {
            'login_data': req.session.logined, 
            'amount' : amount,
        })
    }
})


app.get('/create', async function(req, res){
    await token.create_token('golf', 'GOLF', 0, 1000000000)
    res.redirect('/')
})

app.get("/index", function(req, res){
    // session 존재 유무에 따른 조건식 생성
    if(!req.session.login){
        res.redirect("/")
    }else{
        res.render('index')
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
    console.log(req.body)
    // 유저의 지갑 주소 
    const wallet =  req.query.wallet
    console.log("wallwet=", req.query.wallet)
    // 유저가 결재한 금액
    const price = req.body.price
    console.log("price=", price)
    // 금액만큼 토큰을 충전
    const receipt = await token.trade_token(wallet, price/100)
    console.log("충전결과=", receipt)
    res.render("payappthird.ejs")
})

//대회참가비결제
app.get('/enterpay', async function(req, res){
    // 해당하는 주소로 요청이 들어온 경우 
    // req.session 안에 로그인의 정보가 존재하지 않는다면 
    // 로그인 화면을 보여주고 
    // 존재한다면 index으로 이동

    // 세션에 로그인 정보가 존재하지 않는다면
    if(!req.session.logined){
        let data=0
        if(req.query.data){
            // data = 1
        }
        res.render('login', {
            'state' : data
        })
    }else{
        const wallet = req.session.logined.wallet
        console.log('enterpay 로그인 되었어요')
        console.log(wallet)
        const amount = await token.balance_of(wallet)
        res.render('enterpay.ejs', {
            'login_data': req.session.logined, 
            'amount' : amount
        })
    }
})

//대회참가비결제
app.post('/enterpay', async function(req, res){
    console.log(req.body)
    // 유저의 지갑 주소 
    const wallet =  req.query.wallet
    // 유저가 결재한 금액
    const price = req.body.price/100
    // 금액만큼 토큰을 충전
    const receipt = await trans_from_token(wallet, price)
    console.log(receipt)
    res.render("payappthird")
})



// routing
// 특정한 주소로 요청이 들어왔을때 routes 폴더 안에 js 파일로 이동한다.
// api들을 나눠서 관리 
// 기능별로 js 파일을 나눠서 관리

// 파일 로드 
// () : module.exports가 function의 형태
// 특정 주소로 요청이 들어왔을때는 해당하는 js 파일을 사용
const user = require('./routes/user.js')()
app.use("/", user)

const golf = require("./routes/golf.js")()
app.use("/golf", golf)

const contract = require('./routes/contract')()
app.use("/contract", contract)

// const auth = require('./routes/auth')()
// app.use("/auth", auth)


// 서버 시작 
app.listen(port, function(){
    console.log('Server Start')
}

)