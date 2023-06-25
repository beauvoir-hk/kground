// express 로드
const express = require('express')
const app = express()
// const port = 3000
const port = 5000
//현재 파일의 경로
app.set('views', __dirname+'/views')
app.set('view engine', 'ejs')
//외부 js,css,img등의 파일들의 기본경로
app.use(express.static('public'))

//데이터를 post형식으로 받을때 json의 형태로 변환 
app.use(express.urlencoded({extended:false}))

// 환경변수설정 dotenv 
//민감한 주소를 공유에서 제외가능
require('dotenv').config()

// express-session 모듈을 로드
//로그인 같은 로그인에 대한 정보저장
//임시파일 사용, 수명을 주어 시간이 지나면 파일의 정보를 삭제 
// 임시파일은 유저가 가지고 있다
const session = require('express-session')
// session 설정
app.use(
    session(
        {
            secret : process.env.secret_key, 
            resave : false, 
            saveUninitialized : false, 
            cookie : {
                maxAge : 60000// 1000당 1초(즉 1분)
            }
        }
    )
)
// api들을 생성
// localhost:3000/ 요청시 
// app.get('/', function(req, res){
//     // 해당하는 주소로 요청이 들어온 경우 
//     // req.session 안에 로그인의 정보가 존재하지 않는다면 
//     // 로그인 화면을 보여주고 
//     // 존재한다면 index으로 이동

//     // 세션에 로그인 정보가 존재하지 않는다면
//     if(!req.session.login){
//         let data = 0
//         if(req.query.data){
//             data = 1
//         }
//         res.render('login.ejs', {
//             state : data
//         })
//     }else {
//         console.log("로그인-->index로 감")
//         res.redirect("index.ejs")
//     }
// })

const token = require("./token/token")

app.get('/create', async function(req, res){
    await token.create_token('golf', 'GOLF', 0, 1000000000)
    res.redirect('/')
})

// app.get("/index", function(req, res){
//     // session 존재 유무에 따른 조건식 생성
//     if(!req.session.login){
//         res.render('login.ejs')
//     }else{
//         res.redirect('index')
//     }
// })

//여기가 
app.post('/payment', async function(req, res){
    console.log(req.body)
    // 유저의 지갑 주소 
    const wallet =  req.query.wallet
    // 유저가 결재한 금액
    const price = req.body.price
    // 금액만큼 토큰을 충전
    const receipt = await token.trade_token(wallet, price/100)
    console.log(receipt)
    res.send(receipt)

    // res.redirect('index')
})

// routing
// 특정한 주소로 요청이 들어왔을때 routes 폴더 안에 js 파일로 이동한다.
// api들을 나눠서 관리 
// 기능별로 js 파일을 나눠서 관리

// 파일 로드 
// () : module.exports가 function의 형태
const user = require('./routes/user.js')()
// 특정 주소로 요청이 들어왔을때는 해당하는 js 파일을 사용
app.use("/", user)

const golf = require("./routes/golf.js")()
app.use("/golf", golf)

const contract = require('./routes/contract')()
app.use("/contract", contract)

// const payapp = require('./routes/payapp')()
// app.use("/payapp",payapp)


// 서버 시작 
app.listen(port, function(){
    console.log('Server Start')
    
})