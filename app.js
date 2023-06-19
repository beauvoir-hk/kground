// express 로드 
const express = require('express')
const app = express()
var request = require('request')                                   
var urlencode = require('urlencode')
var queryString = require('querystring')


// dotenv 설정
require('dotenv').config()

// 뷰 파일의 기본 위치와 엔진을 설정
app.set('views', __dirname+'/views')
app.set('view engine', 'ejs')
app.use(express.static('public'))

// post 형식으로 데이터가 들어올때 json의 형태로 변환
app.use(express.urlencoded({extended:false}))

// 환경 변수를 사용하기 위해 설정 
require('dotenv').config()

// express-session 설정
const session = require('express-session')

app.use(
    session(
        {
            secret : process.env.secret_key , 
            resave : false , 
            saveUnintialized : false , 
            cookie: {
                maxAge : 300000 //임시 파일의 수명 (1000당 1초)
            }
        }
    )
)

// api들을 생성
// localhost:3000/ 요청시 
app.get('/', function(req, res){
    // 해당하는 주소로 요청이 들어온 경우 
    // req.session 안에 로그인의 정보가 존재하지 않는다면 
    // 로그인 화면을 보여주고 
    // 존재한다면 index으로 이동

    // 세션에 로그인 정보가 존재하지 않는다면
    if(!req.session.login){
        let data = 0
        if(req.query.data){
            data = 1
        }
        res.render('login', {
            state : data
        })
    }else {
        console.log("로그인-->index로 감")
        res.render("index")
    }
})

// app.get('/create', async function(req, res){
//     await token.create_token('golf', 'GOLF', 0, 1000000000)
//     res.redirect('/')
// })

app.get("/index", function(req, res){
    // session 존재 유무에 따른 조건식 생성
    if(!req.session.login){
        res.render('/')
    }else{
        res.render('index')
    }
})

app.get("/signup", function(req, res){
    // session 존재 유무에 따른 조건식 생성
    if(!req.session.login){
        res.redirect('/')
    }else{
        res.render('signup')
    }
})

app.get("/payapp", function(req, res){
    // session 존재 유무에 따른 조건식 생성
    if(!req.session.login){
        res.redirect('/')
    }else{
        res.render('payappfirst')
    }
})

// 로그인에 관련된 주소 값들은 다른 파일에서 로드해서 사용
const moment = require('moment')
let date = moment()

const token = require('./token/token')


// routes 폴더 안에 있는 js파일을 로드 
const user = require('./routes/user')()
// 특정 주소로 요청이 들어왔을때는 해당하는 js 파일을 사용
app.use("/user", user)

const golf = require("./routes/golf")()
app.use("/golf", golf)

const contract = require('./routes/contract')()
app.use("/contract", contract)

const payapp = require('./routes/payapp')()
app.use("/payapp",payapp)


// 서버 시작 
app.listen(3000, function(){
    console.log('Server Start')
    
    console.log(date.format("YYYY-MM-DD HH:mm:ss"))
})