const express = require("express");
const router = express.Router();
const { isAuth } = require("../middlewares");
const { sendVerificationSMS } = require("../controllers/util");
const { sens } = require("../config");
const CryptoJS = require("crypto-js");
const { createRandomNumber } = require("./functions/utility");
const { sens } = require("../config");
const CryptoJS = require("crypto-js");
const axios = require("axios");

module.exports = ()=>{
    router.get('/code', isAuth, sendVerificationSMS)

    
 // 모듈 임포트
const send_message = require('../sens/sens')

router.post('/', async (req, res, next) => {
    const phone_number = req.body.phone_number
    const user = new UserReg({
        phone_number
    });

    res.setHeader('Content-Type', 'application/json')

    console.log('post is work')
    try {
    	// user 정보를 mongodb에 저장한 후
        await user.save()
    	// send_message 모듈을 실행시킨다. 
        await send_message(phone_number)
        res.send("send message!")
    }catch(err){
        console.log(err)
    }
});

module.exports = router;   

}
