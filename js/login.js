const check_input = () => {
    const loginForm = document.getElementById('login_form');
    const loginBtn = document.getElementById('login_btn');
    const emailInput= document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');

    const c = '아이디, 패스워드를체크합니다';
    alert(c);

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    if (emailValue === '') {
        alert('이메일을입력하세요.');
        return false;
    }

    if (passwordValue === '') {
        alert('비밀번호를입력하세요.');
        return false;
    }

    console.log('이메일:', emailValue);
    console.log('비밀번호:', passwordValue);
    loginForm.submit();
};
    
document.getElementById("login_btn").addEventListener('click', check_input);
