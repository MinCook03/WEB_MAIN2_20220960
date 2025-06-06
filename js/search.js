document.getElementById("search_btn_msg").addEventListener('click',search_message);

function search_message(){
    let a = "검색을 수행합니다.";
    alert(a);
    alert("공백과 비속어를 검사합니다.");
}

function googleSearch() {
    const searchTerm = document.getElementById("search_input").value; // 검색

    const forbiddenWords = ["시X", "바보", "멍청이", "병X", "FXXK"]; //배열로 비속어 목록 만들기

        if (searchTerm === "") {
            alert("검색어를 입력하시오.");
            return false;
        }
    
        for (let word of forbiddenWords) {
            if (searchTerm.includes(word)) {
                alert("비속어는 검색이 되지 않습니다.");
                return false;
            }
        }
    
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
    // 새 창에서 구글 검색을 수행
    window.open(googleSearchUrl, "_blank"); // 새로운 창에서 열기.
    return false;
}
