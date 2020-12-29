document.addEventListener("DOMEventListner", function() {
    let box = document.querySelector(".box");
    let list = document.querySelectorAll(".menu__item");

    list.forEach(elem => {
        elem.innerText = "Hello its Babel";
    });
})