// caver-js-ext-kas 모듈을 로드 
const CaverExtKAS = require('caver-js-ext-kas')
const caver = new CaverExtKAS()

const fs = require('fs')
require('dotenv').config()

// KAS에 접속하기 위한 계정 ID, PASSWORD 입력
const kas_info = require('./kas.json')
const accesskeyId = kas_info.accessKeyId
const secretAccessKey = kas_info.secretAccessKey
console.log("accesskeyId, secretAccessKey=",accesskeyId, secretAccessKey)
// testnet chainID를 지정
// const chainid = 8417
const chainid = 1001

caver.initKASAPI(chainid, accesskeyId, secretAccessKey)
// console.log("process.env.private_key =", process.env.private_key)
// console.log("process.env.public_key =", process.env.public_key)
const acc_private_key = "0x2fe75882b73e785ee1ca5ebabd216240db3c8795e67d92a1391d53ecb8647cc3"
// KAS에서 외부의 지갑을 사용하려면 KAS wallet에 지갑을 등록
const keyringContainer = new caver.keyringContainer()
const keyring = keyringContainer.keyring.createFromPrivateKey(
    acc_private_key    
    )// process.env.private_key

// keyringContainer.add(keyring)

// 토큰을 생성하는 함수 (kip7)
async function create_token(_name, _symbol, _decimal, _amount){
    const kip7 = await caver.kct.kip7.deploy(
        {
            name : _name,               // 토큰의 이름
            symbol : _symbol,           // 토큰의 심볼
            decimals : _decimal,        // 토큰 소수점 자리수
            initialSupply : _amount     // 토큰 발행량
        }, 
        keyring.address, 
        keyringContainer
    )
    const addr = kip7._address
    console.log('token_address :', addr)
    const kip7_address = {'address' : addr}
    // 문자형으로 변환
    const data = JSON.stringify(kip7_address)
    // JSON 파일의 형태로 저장
    fs.writeFileSync('./token/kip7.json', data)
    return "토큰 발행 완료"
}

// 토큰 충전 함수를 생성 
async function trade_token(_address, _amount){
    // 발행한 토큰 컨트랙트를 이용하여 wallet 추가 
    const token_info = require('./kip7.json')
    const kip7 = await new caver.kct.kip7(token_info.address)
    kip7.setWallet(keyringContainer)
    console.log("keyring.address",keyring.address)
    const receipt = await kip7.transfer(
        _address, 
        _amount, 
        {
            from : keyring.address
        }
    )
    console.log('토큰충전',receipt)
    return receipt
}

async function trans_from_token(_user, _amount){
    // // 발행한 토큰을 wallet 추가 
    // const token_info = require('./kip7.json')
    // const kip7 = await new caver.kct.kip7(token_info.address)
    // kip7.setWallet(keyringContainer)

    // 토큰 발행자의 지갑 주소 
    const owner = keyring.address
    console.log(owner)

    // 유저의 지갑 주소를 container에 등록
    // const keyring2 = keyringContainer.keyring.createFromPrivateKey(_user)
    // keyringContainer.add(keyring2)
    console.log("user=", _user)
        // 토큰 발행자의 지갑 주소 
    const user= keyring2.address
    console.log("user=", user)

// 트랜잭션을 생성
const txn = web3.eth.sendTransaction({
    to: user,
    amount: "1000000000000000000",
    gasPrice: "10000000000",
    gasLimit: 90000,
  });
  
  // 트랜잭션을 블록체인에 전송
  await txn.send({
    from: globalFeePayer,
  });
  
  // 트랜잭션의 상태를 확인
  const result = await txn.getReceipt();
  
  console.log(result);
    // approve() 함수를 호출 : 내 지갑에 있는 일정 토큰을 다른 사람이 이동 시킬수 있는 권리를 부여
    // approve(권한을 받을 지갑의 주소, 토큰의 양, from)
    await kip7.approve(owner, _amount, {from : keyring2.address})
    // await kip7.approve(owner, _amount, {from : user})
    // transferFrom 함수를 호출
    const receipt = await kip7.transferFrom(
        keyring2.address, 
        owner, 
        _amount, 
        {
            from : owner
        }
    )
    console.log(receipt)
    return receipt         
}

// 유저가 또 다른 유저에게 토큰을 보내는 함수 
async function trans_from_to_token(_walletfrom, _towallet, _amount){
    // 발행한 토큰을 wallet 추가 
    const token_info = require('./kip7.json')
    const kip7 = await new caver.kct.kip7(token_info.address)
    kip7.setWallet(keyringContainer)

    // 토큰 발행자의 지갑 주소 
    const owner = keyring.address
    console.log(owner)

    // 유저의 지갑 주소를 container에 등록
    const keyring2 = keyringContainer.keyring.createFromPrivateKey(_walletfrom)
    keyringContainer.add(keyring2)
        // 또 다른 유저의 지갑 주소를 container에 등록
    const keyring3 = keyringContainer.keyring.createFromPrivateKey(_towallet)
    keyringContainer.add(keyring3)

    // approve() 함수를 호출 : 내 지갑에 있는 일정 토큰을 다른 사람이 이동 시킬수 있는 권리를 부여
    // approve(권한을 받을 지갑의 주소, 토큰의 양, from)
    await kip7.approve(container2._towallet, _amount, {from : owner})

    // transferFrom 함수를 호출
    const result = await kip7.transferFrom(
        owner,
        container2._towallet, 
        _amount, 
        {
            from : container2._towallet
        }
    )
    console.log(result)
    return result
}



// 토큰의 양을 확인하는 함수 
async function balance_of(_address){
    // 발행한 토큰을 wallet 추가 
    const token_info = require('./kip7.json')
    console.log("token_info=", token_info.address)
    // 해당하는 토큰의 주소를 가지고 올수 없다는 에러입니다. 
    // 에러 나는 이유가 제 KAS에 있는 지갑 주소랑 다른 주소를 사용하셔서 그런건데 회원가입 부분도 이상이 보이네요
    const kip7 = await new caver.kct.kip7(token_info.address)
    kip7.setWallet(keyringContainer)

    const balance = await kip7.balanceOf(_address)
    console.log("balance =",balance )
    console.log(balance)
    return balance
}

// klay 충전 함수를 생성 
async function klay_trade_token(_address){
    const klay_info = require('./kipklay.json')
    const kip7  = await new caver.kct.kip7(klay_info.address)
    kip7 .setWallet(keyringContainer)

    const result = await kip7.transfer(
        _address, 
        0.1, 
        {
            from : keyring.address
        }
    )
    console.log('klay거래',result)
    return result
}    

// klay의 양을 확인하는 함수 
async function balance_of_klay(_address){
    // 발행한 토큰을 wallet 추가 
    // const klay_info = require('./kipklay.json')
    
    const kip7  = await new caver.kct.kip7(klay_info.address)
    kip7 .setWallet(keyringContainer)
    console.log("klay_info=", klay_info.address)
 
    const balance = await kip7.balanceOf(_address)
    console.log("klay balance =",balance )
    console.log(balance)
    return balance
}
// 흔히 아는 앱이나 웹 브라우저의 잔고나 토큰을 보내는 월렛이 아니다
// Account라는 데이터를 잠깐 담아 놓기 위한 컨테이너다
// Account라는 정보를 만들 것인데 키를 만들거나 
// const account = caver.klay.accounts.create(); // Key 페어가 생성된다, 비밀키 공개키가 생성된다
// in-memory wallet
// const wallet = caver.klay.accounts.wallet; // SDK에 넣어주면 보기 편하게 만들어준다 그래서 넣는 것이 좋다
// wallet.add(account);
// console.log(wallet.length); // wallet에 저장된 어카운트 갯수를 리턴
// console.log(wallet[account.address]); // 해당 주소를 가지는 어카운트를 불러옴, 없을 경우 undefined
// console.log(wallet[0]); // 저장된 첫번째 어카운트를 불러옴, 없을 경우 undefined


// 지갑을 생성하는 함수 생성
async function create_wallet(){
       const wallet        = await caver.kas.wallet.createAccount()
    // const account = await caver._kas._wallet.getAccountByName(accesskeyId)
    // const wallet = new caver.kas.wallet(account.private_key)
    console.log("create wallet=", wallet.address)
    console.log("다음으로 가낭?",)
    return wallet.address
}


// 지갑 생성하는 함수 호출
// create_wallet()

// 해당하는 함수들을 외부에서 사용을 할 수 있게 export
module.exports = {
    create_token, 
    trade_token, 
    trans_from_token, 
    trans_from_to_token,
    balance_of, 
    create_wallet,
    klay_trade_token,
    balance_of_klay
}


// 함수 호출
// balance_of('0x3778671B6beA5D1dcdd059F1e226B096c82c13a0')
// create_wallet()

// 함수 호출 
// trans_from_token(process.env.private_key2, 10)


// trade_token('0x2aB031861b7672Df302527129AA090B060496Df5', 111)


// 토큰 생성 함수를 호출
// create_token('test', 'tes', 0, 100000)

// // JSON형태 파일을 생성
// const fs = require('fs')
// const test = {
//     name : 'test'
// }
// // 파일에 데이터를 넣기 위해서는 문자형으로 변환 
// const testJSON = JSON.stringify(test)

// console.log(testJSON)

// fs.writeFileSync('test.json', testJSON)