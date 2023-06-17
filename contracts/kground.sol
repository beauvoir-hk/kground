// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 < 0.9.0;
// 버전 명시

// 컨트렉트의 이름을 지정 
contract kground{
    // 유저의 정보를 저장 컨트렉트 

    // 유저의 정보를 저장하는 구조를 하나 생성
    // mysql table 설정과 흡사
    struct info{
        // 유저의 정보가 존재하는지 확인하는 변수
        uint8 state;
        string phone;
        string pass;
        string username;
        string nickname;
        string refferal;
        string numeric6;
        string wellet;
    }

    mapping (string => info) internal users;

    // 유저의 정보를 등록하는 함수 
    function add_user(
        string memory _phone, 
        string memory _pass, 
        string memory _username, 
        string memory _nickname,
        string memory _refferal, 
        string memory _numeric6, 
        string memory _wellet
       ) public {
        // 회원 정보가 존재한다면 함수의 호출을 거절
        // state가 0이면 회원 정보가 존재하지 않는다. 
        // state가 0이 아니면 회원 정보가 존재.
        require(users[_phone].state == 0, 'Exist ID');
        // mapping 데이터에 _phone값을 키 값으로 value 대입
        users[_phone].phone = _phone;
        users[_phone].pass = _pass;
        users[_phone].username = _username;
        users[_phone].nickname = _nickname;
        users[_phone].refferal = _refferal;
        users[_phone].numeric6 = _numeric6;
        users[_phone].wellet = _wellet;
        users[_phone].state = 1;
    }

    // 유저의 정보를 출력하는 함수 생성 
    function view_info(
        string memory _phone
    ) public view returns(
        string memory, 
        string memory, 
        string memory, 
        string memory,
        string memory, 
        string memory, 
        string memory
    ){
        string memory phone = users[_phone].phone;
        string memory pass = users[_phone].pass;
        string memory username = users[_phone].username;
        string memory nickname = users[_phone].nickname;
        string memory refferal = users[_phone].refferal;
        string memory numeric6 = users[_phone].numeric6;
        string memory wellet = users[_phone].wellet;

        return (phone, pass, username, nickname, refferal,numeric6,wellet);
    }



}
