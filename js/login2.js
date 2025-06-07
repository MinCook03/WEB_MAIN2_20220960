import { session_set, session_get, session_check } from './session.js';
import { encrypt_text, decrypt_text } from './crypto.js';
import { generateJWT, checkAuth } from './jwt_token.js';

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
    document.cookie = escape(name) + "=" + escape(value) + "; expires=" + date.toUTCString() + "; path=/";
};

function getCookie(name) {
    var cookie = document.cookie;
    console.log("쿠키를 요청합니다.");
    if (cookie != "") {
        var cookie_array = cookie.split("; ");
        for (var index in cookie_array) {
            var cookie_name = cookie_array[index].split("=");
            if (cookie_name[0] == name) {  // "id" 대신 name 사용
                return unescape(cookie_name[1]);  // unescape 추가
            }
        }
    }
    return "";  // 빈 문자열 반환
}
// 로그인 실패 함수 (1분 제한)
const login_failed = () => {
    const cookieValue = getCookie("login_failed_cnt");
    const currentCount = cookieValue && cookieValue !== "" ? parseInt(cookieValue) : 0;
    const newCount = currentCount + 1;
    
    setCookieMinutes("login_failed_cnt", newCount.toString(), 1); // 1분 후 만료
    
    console.log("로그인 실패 횟수:", newCount);
    
    if (newCount >= 3) {
        alert("로그인 실패 횟수가 3회에 도달했습니다. 1분간 로그인이 제한됩니다.");
        setCookieMinutes("login_blocked", "true", 1); // 1분간 제한
        return true;
    } else {
        alert(`로그인 실패 횟수: ${newCount}회 (3회 도달 시 1분간 로그인 제한)`);
        return false;
    }
};

// 로그인 제한 상태 확인 함수
const check_login_blocked = () => {
    const blockedStatus = getCookie("login_blocked");
    const failedCount = getCookie("login_failed_cnt");
    
    if (blockedStatus === "true" || parseInt(failedCount) >= 3) {
        return true;
    }
    return false;
};

// 로그인 실패 횟수 초기화 함수 (로그인 성공 시 사용)
const reset_login_failed = () => {
    setCookie("login_failed_cnt", "", -1); // 쿠키 삭제
    setCookie("login_blocked", "", -1); // 제한 상태 쿠키 삭제
};

const login_count = () => {
    const cookieValue = getCookie("login_cnt");
    const currentCount = cookieValue && cookieValue !== "" ? parseInt(cookieValue) : 0;
    const newCount = currentCount + 1;
    
    setCookie("login_cnt", newCount.toString(), 30);
    
    console.log("로그인 횟수:", newCount);
    alert("로그인 횟수: " + newCount + "회");
};

function validateLoginCredentials(inputEmail, inputPassword) {
    // 세션에서 회원가입 정보 가져오기
    const signupData = sessionStorage.getItem("Session_Storage_join");
    
    if (!signupData) {
        alert("회원가입 정보가 없습니다. 먼저 회원가입을 해주세요.");
        return false;
    }
    
    try {
        const signupInfo = JSON.parse(signupData);
        
        // 이메일과 비밀번호 비교
        if (signupInfo._email === inputEmail && signupInfo._password === inputPassword) {
            console.log("로그인 성공: 회원가입 정보와 일치");
            alert("로그인 성공")
            return true;
        } else {
            alert("아이디 또는 비밀번호가 일치하지 않습니다.");
            return false;
        }
    } catch (error) {
        console.error("회원가입 정보 파싱 오류:", error);
        alert("회원가입 정보를 확인할 수 없습니다.");
        return false;
    }
}


const check_input = () => {
    if (check_login_blocked()) {
        const failedCount = getCookie("login_failed_cnt") || 0;
        alert(`로그인이 제한되었습니다. 실패 횟수: ${failedCount}회\n관리자에게 문의하거나 시간이 지난 후 다시 시도해주세요.`);

             // 입력 필드 비활성화
        document.getElementById('typeEmailX').disabled = true;
        document.getElementById('typePasswordX').disabled = true;
        document.getElementById('login_btn').disabled = true;
        
        return false;
    }

    const idsave_check = document.getElementById('idSaveCheck');
    const payload = {
        id: emailValue,
        exp: Math.floor(Date.now() / 1000) + 3600 // 1시간 (3600초)
    };
    const jwtToken = generateJWT(payload);
    const loginForm = document.getElementById('login_form');
    const loginBtn = document.getElementById('login_btn');
    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');
    const c = '아이디, 패스워드를 체크합니다';
    alert(c);
    
    

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    const sanitizedPassword = check_xss(passwordInput.value);
    // check_xss 함수로 비밀번호 Sanitize
    const sanitizedEmail = check_xss(emailInput.value);
    // check_xss 함수로 비밀번호 Sanitize
    
    if (emailValue === '') {
    alert('이메일을 입력하세요.');
    login_failed(); //실패카운트
    return false;
    }
    if (passwordValue === '') {
    alert('비밀번호를 입력하세요.');
    login_failed(); //실패카운트
    return false;
    }
           // @ 기호 존재 여부 확인
    if (!emailValue.includes('@')) {
        alert('올바른 이메일 형식이 아닙니다.');
        login_failed(); // 실패 카운트 증가
        return false;
    }
    
    // 로컬 파트(@ 앞부분)만 추출하여 길이 검사
    const localPart = emailValue.split('@')[0];
    if (localPart.length > 10) {
        alert('이메일의 @ 앞부분은 10글자 이하로 입력해야 합니다.');
        login_failed(); // 실패 카운트 증가
        return false;
    }
    
    if (localPart.length < 3) {
        alert('이메일의 @ 앞부분은 최소 3글자 이상 입력해야 합니다.');
        login_failed(); // 실패 카운트 증가
        return false;
    }
    if (passwordValue.length > 15) {
        alert('비밀번호는 15글자 이하로 입력해야 합니다.');
        login_failed(); // 실패 카운트 증가
        return false;
    }

    if (emailValue.length < 5) {
        alert('아이디는 최소 5글자 이상 입력해야 합니다.');
        login_failed(); // 실패 카운트 증가
        return false;
    }
    
    if (passwordValue.length < 10) {
        alert('비밀번호는 반드시 10글자 이상 입력해야 합니다.');
        login_failed(); // 실패 카운트 증가
        return false;
    }

      // 3글자 이상 반복 입력 검사 (이메일)
    const repeatedPattern = /(.{3,})\1/;
    if (repeatedPattern.test(emailValue)) {
        alert('이메일에 3글자 이상 반복되는 패턴은 사용할 수 없습니다.');
         login_failed(); // 실패 카운트 증가
        return false;
    }
    
      // 3글자 이상 반복 입력 검사 (패스워드)
    if (repeatedPattern.test(passwordValue)) {
        alert('패스워드에 3글자 이상 반복되는 패턴은 사용할 수 없습니다.');
         login_failed(); // 실패 카운트 증가
        return false;
    }

      // 연속되는 숫자 2개 이상 반복 검사 (이메일)
    const consecutiveNumbers = /(\d{2,})/g;
    const emailMatches = emailValue.match(consecutiveNumbers);
    if (emailMatches) {
        for (let match of emailMatches) {
            const regex = new RegExp(match.replace(/\d/g, '\\d'), 'g');
            const occurrences = (emailValue.match(regex) || []).length;
            if (occurrences > 1) {
                alert('이메일에 연속되는 숫자 2개 이상이 반복될 수 없습니다.');
                login_failed(); // 실패 카운트 증가
                return false;
            }
        }
    }

      // 연속되는 숫자 2개 이상 반복 검사 (패스워드)
    const passwordMatches = passwordValue.match(consecutiveNumbers);
    if (passwordMatches) {
        for (let match of passwordMatches) {
            const regex = new RegExp(match.replace(/\d/g, '\\d'), 'g');
            const occurrences = (passwordValue.match(regex) || []).length;
            if (occurrences > 1) {
                alert('패스워드에 연속되는 숫자 2개 이상이 반복될 수 없습니다.');
                login_failed(); // 실패 카운트 증가
                return false;
            }
        }
    }
    
    const hasSpecialChar = passwordValue.match(/[!,@#$%^&*()_+\- =\[\]{};':"\\|,.<>\/?]+/) !== null;
    
    if (!hasSpecialChar) {
        alert('패스워드는 특수문자를 1개 이상 포함해야 합니다.');
        login_failed(); // 실패 카운트 증가
        return false;
    }
    const hasUpperCase = passwordValue.match(/[A-Z]+/) !== null;
    const hasLowerCase = passwordValue.match(/[a-z]+/) !== null;
    
    if (!hasUpperCase || !hasLowerCase) {
        alert('패스워드는 대소문자를 1개 이상 포함해야 합니다.');
        login_failed(); // 실패 카운트 증가
        return false;
    }

    // 회원가입 정보와 비교 검증 추가
    if (!validateLoginCredentials(emailValue, passwordValue)) {
        login_failed();
        return false;
    }



    
    if (!sanitizedEmail) {
        // Sanitize된 비밀번호 사용
        return false;
    }
    if (!sanitizedPassword) {
        // Sanitize된 비밀번호 사용
        return false;
    }

    // 로그인 성공 시 실패 횟수 초기화
    reset_login_failed();

    // 검사 마무리 단계 쿠키 저장, 최하단 submit 이전
    if(idsave_check.checked == true) { // 아이디 체크 o
        alert("쿠키를 저장합니다.", emailValue);
        setCookie("id", emailValue, 1); // 1일 저장
        alert("쿠키 값 :" + emailValue);
    }
    else{ // 아이디 체크 x
        setCookie("id", emailValue.value, 0); //날짜를 0 - 쿠키 삭제
    }
    
    login_count();

    console.log('이메일:', emailValue);
    console.log('비밀번호:', passwordValue);
    
    loginForm.submit();
    };
    document.getElementById("login_btn").addEventListener('click', check_input);


function init(){ // 로그인 폼에 쿠키에서 가져온 아이디 입력
    const emailInput = document.getElementById('typeEmailX');
    const idsave_check = document.getElementById('idSaveCheck');
    let get_id = getCookie("id");
        
    if(get_id) {
    emailInput.value = get_id;
    idsave_check.checked = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    init_logined();
});

function session_set() { //세션 저장
    localStorage.setItem('jwt_token', jwtToken);
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
function init_logined(){
    if(sessionStorage){
        decrypt_text(); // 복호화 함수
}
else{
    alert("세션 스토리지 지원 x");
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


