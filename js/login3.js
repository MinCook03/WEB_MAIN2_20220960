const check_xss = (input) => {
    // DOMPurify 라이브러리 로드 (CDN 사용)
    const DOMPurify = window.DOMPurify;
    // 입력 값을 DOMPurify로 sanitize
    const sanitizedInput = DOMPurify.sanitize(input);
    // Sanitized된 값과 원본 입력 값 비교
    if (sanitizedInput !== input) {
    // XSS 공격 가능성 발견 시 에러 처리
        alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
        return false;
    }
    // Sanitized된 값 반환
    return sanitizedInput;
};

function setCookie(name, value, expiredays) {
    var date = new Date();
    date.setDate(date.getDate() + expiredays);
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + "; expires=" + date.toUTCString() + "; path=/";
}

// 분 단위 쿠키 설정 함수
const setCookieMinutes = (name, value, expireMinutes) => {
    const date = new Date();
    date.setTime(date.getTime() + (expireMinutes * 60 * 1000));
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + "; expires=" + date.toUTCString() + "; path=/";
};


function getCookie(name) {
    var cookie = document.cookie;
    console.log("쿠키를 요청합니다.");
    if (cookie != "") {
        var cookie_array = cookie.split("; ");
        for (var index in cookie_array) {
            var cookie_name = cookie_array[index].split("=");
            if (cookie_name[0] == name) {  // "id" 대신 name 사용
                return decodeURIComponent(cookie_name[1]);  // decodeURIComponent로 변경
            }
        }
    }
    return "";  // 빈 문자열 반환
}

// init 함수 개선 버전
function init() {
    const emailInput = document.getElementById('typeEmailX');
    const idsave_check = document.getElementById('idSaveCheck');
    
    if (!emailInput || !idsave_check) {
        console.error('init: 필수 요소 누락');
        return;
    }
    
    const savedId = getCookie("id");
    if (savedId) {
        emailInput.value = savedId;
        idsave_check.checked = true;
    }
    updateLoginStatus(); // 로그인 상태 및 실패 횟수 표시
    session_check(); // 세션 유무 검사
}

// 이벤트 리스너 수정
window.addEventListener('DOMContentLoaded', function() {
    init();  // DOM 준비 완료 후 초기화
    document.getElementById("login_btn").addEventListener('click', function(e) {
        e.preventDefault();
        check_input();
    });
});



// 로그인 실패 시 호출되는 함수
function login_failed() {
    // 실패 횟수 쿠키 가져오기
    let failCount = parseInt(getCookie('login_fail_count')) || 0;
    failCount += 1;

    // 쿠키에 실패 횟수 저장 (1일간 유지)
    setCookie('login_fail_count', failCount, 1);

    // 실패 횟수 및 제한 상태 갱신
    updateLoginStatus();

    // 3회 이상 실패 시 로그인 제한
    if (failCount >= 3) {
        alert('로그인 시도 3회 초과로 로그인이 제한됩니다.');
        return false;
    }
}

// 로그인 제한 상태 및 실패 횟수 표시 함수
function updateLoginStatus() {
    const failCount = parseInt(getCookie('login_fail_count')) || 0;
    const statusDiv = document.getElementById('loginStatus');
    if (failCount >= 3) {
        statusDiv.innerHTML = `<span style="color:red;">로그인 제한: ${failCount}회 실패로 로그인 제한 상태입니다.</span>`;
    } else {
        statusDiv.innerHTML = `로그인 실패 횟수: ${failCount}회`;
    }
}

// 로그인 제한 여부 확인 함수
function isLoginLimited() {
    const failCount = parseInt(getCookie('login_fail_count')) || 0;
    return failCount >= 3;
}



const check_input = () => {

    const loginForm = document.getElementById('login_form'); 
    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');
    const idsave_check = document.getElementById('idSaveCheck');

    if (isLoginLimited()) {
        alert('로그인 시도 3회 초과로 로그인이 제한되었습니다.');
        updateLoginStatus();
        return false;
    }

    alert('아이디, 패스워드를 체크합니다');

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    // 1. 빈값 체크
    if (!emailValue) {
        alert('이메일을 입력하세요.');
        login_failed(); // 실패 카운트 증가
        return false;
    }
    if (!passwordValue) {
        alert('비밀번호를 입력하세요.');
        login_failed(); // 실패 카운트 증가
        return false;
    }

    // 2. XSS 검사 (가장 먼저 실행)
    const sanitizedEmail = check_xss(emailValue);
    const sanitizedPassword = check_xss(passwordValue);
    
    if (!sanitizedEmail || !sanitizedPassword) return false;

    // 3. 이메일 @ 앞부분 길이 체크
    const emailLocalPart = sanitizedEmail.split('@')[0];
    if (emailLocalPart.length > 10) {
        alert('이메일의 @ 앞부분은 10글자 이하로 입력하세요.');
        return false;
    }

    // 4. 비밀번호 길이 체크
    if (sanitizedPassword.length > 15) {
        alert('비밀번호는 15글자 이하로 입력하세요.');
        return false;
    }

    // 5. 반복 패턴 체크
    const repeatPattern = /(.{3,})\1+/;
    const repeatNumberPattern = /(\d{2,})\1+/;

    [sanitizedEmail, sanitizedPassword].forEach((value, index) => {
        if (repeatPattern.test(value)) {
            alert(`${index ? '비밀번호' : '이메일'}에 3글자 이상 반복되는 패턴이 있습니다.`);
            throw new Error('Validation Failed'); // 루프 종료용
        }
        if (repeatNumberPattern.test(value)) {
            alert(`${index ? '비밀번호' : '이메일'}에 2자리 이상 연속되는 숫자 반복이 있습니다.`);
            throw new Error('Validation Failed'); // 루프 종료용
        }
    });
    
    if(idsave_check.checked == true) { // 아이디 체크 o
        alert("쿠키를 저장합니다.", emailValue);
         setCookie("id", emailValue, 1); // 1일 저장
        alert("쿠키 값 :" + emailValue);
    }
      else{ // 아이디 체크 x
         setCookie("id", emailValue.value, 0); //날짜를 0 - 쿠키 삭제
    }

    function session_set() { //세션 저장
    let session_id = document.querySelector("#typeEmailX"); // DOM 트리에서 ID 검색
    let session_pass = document.querySelector("#typePasswordX"); // DOM 트리에서 pass 검색
    if (sessionStorage) {
        let en_text = encrypt_text(session_pass.value);
        sessionStorage.setItem("Session_Storage_id", session_id.value);
        sessionStorage.setItem("Session_Storage_pass", en_text);
    } else {
        alert("로컬 스토리지 지원 x");
    }
    }

    // function session_del() {//세션 삭제
    // if (sessionStorage) {
    //     sessionStorage.removeItem("Session_Storage_test");
    //     alert('로그아웃 버튼 클릭 확인 : 세션 스토리지를 삭제합니다.');
    // } else {
    //     alert("세션 스토리지 지원 x");
    // }
    // }
    

    function init_logined(){
        if(sessionStorage){
            decrypt_text(); // 복호화 함수
    }
    else{
        alert("세션 스토리지 지원 x");
    }
    }


    // 모든 검증 통과
    console.log('이메일:', sanitizedEmail);
    console.log('비밀번호:', sanitizedPassword);
    session_set(); // 세션 생성
    setCookie('login_fail_count', 0, 1);
    updateLoginStatus();

    document.getElementById('login_form').submit();
    return true;
};

window.addEventListener('DOMContentLoaded', function() {
    document.getElementById("login_btn").addEventListener('click', function(e) {
        e.preventDefault(); // 폼 자동 제출 방지
        check_input();
    });
});