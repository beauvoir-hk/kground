// caver-js-ext-kas 모듈을 로드 
const CaverExtKAS = require('caver-js-ext-kas')
const caver = new CaverExtKAS()
const fs = require('fs')
require('dotenv').config()

// KAS에 접속하기 위한 KAS ID, PASSWORD 입력
const kas_info = require('./kas.json')
const accesskeyId = kas_info.accessKeyId
const secretAccessKey = kas_info.secretAccessKey
console.log(accesskeyId, secretAccessKey)
// testnet chainID를 지정
// const chainid = 8417
const chainid = 8417

caver.initKASAPI(chainid, accesskeyId, secretAccessKey)
console.log(process.env.private_key)

// KAS에서 외부의 지갑을 사용하려면 KAS wallet에 지갑을 등록
const keyringContainer = new caver.keyringContainer()
const keyring = keyringContainer.keyring.createFromPrivateKey(
    process.env.private_key
)
keyringContainer.add(keyring)

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

// 토큰을 거래하는 함수를 생성 
async function trade_token(_address, _amount){
    // 발행한 토큰을 wallet 추가 
    const token_info = require('./kip7.json')
    const kip7 = await new caver.kct.kip7(token_info.address)
    kip7.setWallet(keyringContainer)

    const receipt = await kip7.transfer(
        _address, 
        _amount, 
        {
            from : keyring.address
        }
    )
    console.log('토큰거래',receipt)
    return receipt
}

// 유저가 토큰 발행자에게 토큰을 보내는 함수 
    async function trans_from_token(_private, _amount){
        // 발행한 토큰을 wallet 추가 
        const token_info = require('./kip7.json')
        const kip7 = await new caver.kct.kip7(token_info.address)
        kip7.setWallet(keyringContainer)

        // 토큰 발행자의 지갑 주소 
        const owner = keyring.address
        console.log(owner)

        // 유저의 지갑 주소를 container에 등록
        const keyring2 = keyringContainer.keyring.createFromPrivateKey(_private)
        keyringContainer.add(keyring2)

        // approve() 함수를 호출 : 내 지갑에 있는 일정 토큰을 다른 사람이 이동 시킬수 있는 권리를 부여
        // approve(권한을 받을 지갑의 주소, 토큰의 양, from)
        await kip7.approve(owner, _amount, {from : keyring2.address})

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
    // const keyring2 = keyringContainer.keyring.createFromPrivateKey(_walletfrom)
    // keyringContainer.add(keyring2)
    const containerName1 = "my-container-1"
    const containerName2 = "my-container-2"
    // 컨테이너를 생성합니다.
    const container1 = await docker.createContainer({
        name: containerName1,
        image: "my-image",
        command: "my-command",
        ports: ["8080:80"],
    })
    const container2 = await docker.createContainer({
        name: containerName2,
        image: "my-image",
        command: "my-command",
        ports: ["8081:80"],
    })
    await container1.start();
    await container2.start();
    await container1.registerWalletAddress(_walletfrom)
    // 또 다른 유저의 지갑 주소를 container에 등록
    // const keyring3 = keyringContainer.keyring.createFromPrivateKey(_towallet)
    // keyringContainer.add(keyring3)
    await container2.registerWalletAddress(_towallet)
    // approve() 함수를 호출 : 내 지갑에 있는 일정 토큰을 다른 사람이 이동 시킬수 있는 권리를 부여
    // approve(권한을 받을 지갑의 주소, 토큰의 양, from)
    await kip7.approve(owner, _amount, {from : container1._walletfrom})

    // transferFrom 함수를 호출
    const receipt = await kip7.transferFrom(
        container1._walletfrom, 
        owner, 
        _amount, 
        {
            from : owner
        }
    )
    console.log(receipt)

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
    console.log(token_info.address)
    // 해당하는 토큰의 주소를 가지고 올수 없다는 에러입니다. 
    // 에러 나는 이유가 제 KAS에 있는 지갑 주소랑 다른 주소를 사용하셔서 그런건데 회원가입 부분도 이상이 보이네요
    const kip7 = await new caver.kct.kip7(token_info.address)
    kip7.setWallet(keyringContainer)

    const balance = await kip7.balanceOf(_address)

    console.log(balance)
    return balance
}

// 지갑을 생성하는 함수 생성
async function create_wallet(){
    const wallet = await caver.kas.wallet.createAccount()
    console.log(wallet)
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
    create_wallet
}


// 함수 호출
// balance_of('0x3778671B6beA5D1dcdd059F1e226B096c82c13a0')


// 함수 호출 
// trans_from_token(process.env.private_key2, 10)


// trade_token('0xd52863320168D36402EFb31b36515D723656258D', 100)


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