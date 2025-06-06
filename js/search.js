document.getElementById("search_button_msg").addEventListener('click',search_message);

function search_message(){
    let a = "검색을 수행합니다.";
    alert(a);
}

function googleSearch() {
    const searchTerm = document.getElementById("search_input").value;
}