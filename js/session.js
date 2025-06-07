// import { encrypt_text, decrypt_text } from '../js/crypto.js';

function session_set() { //세션 저장
    let session_id = document.querySelector("#typeEmailX");
    if (sessionStorage) {
        sessionStorage.setItem("Session_Storage_test", session_id.value);
    
    } else {
        alert("로컬 스토리지 지원 x");
    }
}
export function session_set2(){ //세션 저장(객체)
    let id = document.querySelector("#typeEmailX");
    let password = document.querySelector("#typePasswordX");
    let random = new Date(); // 랜덤 타임스탬프

    const obj = { // 객체 선언
    id : id.value,
    otp : random
    }
}

function session_del() {//세션 삭제
    if (sessionStorage) {
        sessionStorage.removeItem("Session_Storage_test");
        alert('로그아웃 버튼 클릭 확인 : 세션 스토리지를 삭제합니다.');
    } else {
        alert("세션 스토리지 지원 x");
    }
}

async function session_get() { //세션 읽기
    if (sessionStorage) {
        const objString = JSON.stringify(obj); // 객체 -> JSON 문자열 변환
        let en_text = await encrypt_text(objString); // 암호화

        sessionStorage.setItem("Session_Storage_id", id.value);
        sessionStorage.setItem("Session_Storage_object", objString);
        sessionStorage.setItem("Session_Storage_pass", en_text);
    } else {
        alert("세션 스토리지 지원 x");
    }
}


function session_check() { 
    // 현재 페이지가 로그아웃 페이지인 경우 세션 체크 생략
    if (window.location.pathname.includes('logout.html')) {
        return;
    }

    //세션 검사
    if (sessionStorage.getItem("Session_Storage_id")) {
        alert("이미 로그인 되었습니다.");
        location.href='../login/index_login.html'; // 로그인된 페이지로 이동
    }
}


