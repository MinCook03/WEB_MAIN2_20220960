const check_xss = (input) => {
    const DOMPurify = window.DOMPurify;
    const sanitizedInput = DOMPurify.sanitize(input);
    
    if (sanitizedInput !== input) {
        alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
        return false;
    }
    return sanitizedInput;
};

const check_input = () => {
    const loginForm = document.getElementById('login_form');
    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');

    alert('아이디, 패스워드를 체크합니다');

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    // 1. 빈값 체크
    if (!emailValue) {
        alert('이메일을 입력하세요.');
        return false;
    }
    if (!passwordValue) {
        alert('비밀번호를 입력하세요.');
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

    // 모든 검증 통과
    console.log('이메일:', sanitizedEmail);
    console.log('비밀번호:', sanitizedPassword);
    loginForm.submit();
    return true;
};

window.addEventListener('DOMContentLoaded', function() {
    document.getElementById("login_btn").addEventListener('click', function(e) {
        e.preventDefault(); // 폼 자동 제출 방지
        check_input();
    });
});