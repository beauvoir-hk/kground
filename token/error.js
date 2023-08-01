
// express를 사용하기 위하여 express 모듈을 로드 
const express = require('express')
const res = require('express').response
var req = require('request') 
const fs = require('fs')
// route부분이기 때문에 express.Router()
const router = express.Router()
const moment = require('moment')
require('dotenv').config()

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


async function login_error(){
    myPopup=window.open("https://kground.co.kr/error_login", "kground", "width=500,  height=300") 
    return myPopup
}
async function close(myPopup){
    window.close(myPopup) 
}
async function fail(){
          alert("로그인 실패")
}


module.exports = {
    login_error,
    close, 
    fail
}

