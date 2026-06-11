let cart = JSON.parse(localStorage.getItem("cart")) || [];
let promoPercent = Number(localStorage.getItem("promoPercent")) || 0;
const DELIVERY_FEE = 1500;

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("promoPercent", String(promoPercent));
    updateCartCount();
    loadCart();
}

function addToCart(name, price, img, size, color) {
    price = Number(price);

    const foundIndex = cart.findIndex(item =>
        item.name === name &&
        Number(item.price) === price &&
        item.img === img &&
        item.size === size &&
        item.color === color
    );

    if (foundIndex !== -1) {
        cart[foundIndex].qty += 1;
    } else {
        cart.push({
            name,
            price,
            img,
            size,
            color,
            qty: 1
        });
    }

    saveCart();

    if (typeof showToast === "function") {
        showToast(name, img);
    }
}

function updateQuantity(index, delta) {
    if (!cart[index]) return;

    cart[index].qty += delta;

    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
}

function loadCart() {
    const container = document.getElementById("cart-items");
    if (!container) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">Корзина пока пустая 🛒</div>';
        updateSummary(0);
        return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = Number(item.price) * Number(item.qty || 1);
        subtotal += itemTotal;

        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.img}" class="cart-img" alt="${item.name}">

                <div class="cart-info">
                    <h3>${item.name}</h3>
                    <div class="cart-meta">
                    Размер: ${item.size}<br>
                    Цвет: ${item.color}
</div>
                
                    <div class="cart-price">${itemTotal.toLocaleString("ru-RU")} ₸</div>
                </div>

                <div class="cart-actions">
                    <div class="qty-box">
                        <button type="button" onclick="updateQuantity(${index}, -1)">−</button>
                        <span>${item.qty}</span>
                        <button type="button" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>

                    <button type="button" class="remove-btn" onclick="removeItem(${index})">
                        Удалить
                    </button>
                </div>
            </div>
        `;
    });

    updateSummary(subtotal);
}

function updateSummary(subtotal) {
    const discount = Math.round(subtotal * (promoPercent / 100));
    const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
    const total = subtotal - discount + delivery;

    const subtotalBox = document.getElementById("subtotal");
    const discountBox = document.getElementById("discount");
    const deliveryBox = document.getElementById("delivery");
    const totalBox = document.getElementById("total");

    if (subtotalBox) subtotalBox.textContent = `${subtotal.toLocaleString("ru-RU")} ₸`;
    if (discountBox) discountBox.textContent = `-${discount.toLocaleString("ru-RU")} ₸`;
    if (deliveryBox) deliveryBox.textContent = `${delivery.toLocaleString("ru-RU")} ₸`;
    if (totalBox) totalBox.textContent = `${total.toLocaleString("ru-RU")} ₸`;
}

function updateCartCount() {
    const counter = document.getElementById("cart-count");
    if (counter) {
        const count = cart.reduce((sum, item) => sum + Number(item.qty || 1), 0);
        counter.textContent = count;
    }
}

function applyPromo() {
    const input = document.getElementById("promo-code");
    if (!input) return;

    const code = input.value.trim().toUpperCase();

    if (code === "STYLE10") {
        promoPercent = 10;
        localStorage.setItem("promoPercent", String(promoPercent));
        alert("Промокод применён: скидка 10%");
        loadCart();
    } else if (code === "") {
        alert("Введите промокод");
    } else {
        promoPercent = 0;
        localStorage.setItem("promoPercent", "0");
        alert("Неверный промокод");
        loadCart();
    }
}

function checkout() {
    if (cart.length === 0) {
        alert("Корзина пустая");
        return;
    }
    openOrderForm();
}

function openOrderForm() {
    const modal = document.getElementById("order-modal");
    if (modal) modal.style.display = "flex";
}

function closeOrderForm() {
    const modal = document.getElementById("order-modal");
    if (modal) modal.style.display = "none";
}

function submitOrder() {
    const name = document.getElementById("order-name")?.value.trim();
    const phone = document.getElementById("order-phone")?.value.trim();
    const address = document.getElementById("order-address")?.value.trim();

    if (!name || !phone || !address) {
        alert("Заполните все поля");
        return;
    }

     showSuccessModal();

    cart = [];
    promoPercent = 0;
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("promoPercent", "0");

    closeOrderForm();
    updateCartCount();
    loadCart();
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    loadCart();
});

function showToast(name, img){

    const toast = document.getElementById("toast");
    if (!toast) return;

    const nameEl = document.getElementById("toast-name");
    const imgEl = document.getElementById("toast-img");

    if (nameEl) nameEl.innerText = name;
    if (imgEl) imgEl.src = img;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function addToCartFromPage() {

    const name = document.getElementById("product-name").innerText;

    // ✅ УНИВЕРСАЛЬНОЕ ИЗВЛЕЧЕНИЕ ЦЕНЫ
    const priceText = document.getElementById("product-price").innerText;
    const price = parseInt(priceText.replace(/[^\d]/g, "")); // 💥 САМОЕ ВАЖНОЕ ИСПРАВЛЕНИЕ

    const img = document.getElementById("product-img").src;
    const size = document.getElementById("size").value;
    const color = document.getElementById("color").value;

    const foundIndex = cart.findIndex(item =>
        item.name === name &&
        item.price === price &&
        item.size === size &&
        item.color === color
    );

    if (foundIndex !== -1) {
        cart[foundIndex].qty += 1;
    } else {
        cart.push({
            name,
            price,
            img,
            size,
            color,
            qty: 1
        });
    }

    saveCart();
    showToast(name, img);
}

function submitDelivery(){

    let name =
    document.getElementById("delivery-name").value;

    let phone =
    document.getElementById("delivery-phone").value;

    let address =
    document.getElementById("delivery-address").value;

    if(!name || !phone || !address){

        alert("Заполните все поля");

        return;
    }

    showDeliveryModal();
}

function submitReturn(){

    const order = document.getElementById("return-order");
    const reason = document.getElementById("return-reason");

    if(!order || !reason){
        alert("Не найдены поля возврата");
        return;
    }

    if(!order.value || !reason.value){
        alert("Заполните все поля");
        return;
    }

    const modal = document.getElementById("return-success");

    if(modal){
        modal.style.display = "flex";
    }
}

function closeReturnModal(){

    const modal = document.getElementById("return-success");

    if(modal){
        modal.style.display = "none";
    }

    window.location.href = "index.html";
}


function scrollToTop(event){
    event.preventDefault();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function goBack(){

    if(
        window.location.pathname.includes("index.html") ||
        window.location.pathname === "/"
    ){
        return;
    }

    window.history.back();
}

window.addEventListener("DOMContentLoaded", () => {

    const backBtn = document.getElementById("backBtn");

    if(
        window.location.pathname.includes("index.html") ||
        window.location.pathname === "/"
    ){
        if(backBtn){
            backBtn.style.display = "none";
        }
    }

});

function scrollToTop(event){

    event.preventDefault();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

/* ПОКАЗ КНОПКИ ТОЛЬКО ВНИЗУ */

window.addEventListener("scroll", () => {

    const topBtn = document.getElementById("topBtn");

    if(window.scrollY > 300){
        topBtn.style.opacity = "1";
        topBtn.style.pointerEvents = "auto";
    } else {
        topBtn.style.opacity = "0";
        topBtn.style.pointerEvents = "none";
    }

});

function showSuccessModal(){
    const modal = document.getElementById("success-modal");

    if(modal){
        modal.style.display = "flex";
    }
}

function closeSuccessModal(){
    const modal = document.getElementById("success-modal");

    if(modal){
        modal.style.display = "none";
    }

    window.location.href = "index.html";
}

function toggleTheme(){

    document.body.classList.toggle("dark-theme");

    const icon = document.getElementById("themeIcon");

    if(document.body.classList.contains("dark-theme")){

        localStorage.setItem("theme", "dark");

        icon.innerHTML = `
        <path d="M12 18a6 6 0 1 1 0-12
        6 6 0 0 1 0 12zm0-16v3m0 14v3
        m10-10h-3M5 12H2m15.07
        7.07-2.12-2.12M8.05
        8.05 5.93 5.93m12.14
        0-2.12 2.12M8.05
        15.95l-2.12 2.12"
        stroke="white"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"/>
        `;

    } else {

        localStorage.setItem("theme", "light");

        icon.innerHTML = `
        <path d="M21 12.79A9 9 0 0 1 11.21 3
        7 7 0 1 0 21 12.79z"/>
        `;
    }
}

/* СОХРАНЕНИЕ ТЕМЫ */

window.addEventListener("DOMContentLoaded", () => {

    const savedTheme = localStorage.getItem("theme");

    if(savedTheme === "dark"){

        document.body.classList.add("dark-theme");

        const btn = document.getElementById("themeToggle");

        if(btn){
            btn.innerHTML = "☀️";
        }
    }

});

/* ===== СЛАЙДЕР ===== */

const slides = document.querySelectorAll(".slide");

let currentSlide = 0;

setInterval(() => {

    slides[currentSlide].classList.remove("active");

    currentSlide++;

    if(currentSlide >= slides.length){
        currentSlide = 0;
    }

    slides[currentSlide].classList.add("active");

}, 4000);

function showDeliveryModal(){

    const modal =
    document.getElementById("delivery-success");

    if(modal){
        modal.style.display = "flex";
    }
}

function closeDeliveryModal(){

    const modal =
    document.getElementById("delivery-success");

    if(modal){
        modal.style.display = "none";
    }

    window.location.href = "index.html";
}

function submitReturn(){

    const order =
    document.getElementById("return-order");

    const reason =
    document.getElementById("return-reason");

    if(!order.value || !reason.value){

        showWarningModal();

        return;
    }

    const modal =
    document.getElementById("return-success");

    if(modal){
        modal.style.display = "flex";
    }
}

function closeReturnModal(){

    const modal =
    document.getElementById("return-success");

    if(modal){
        modal.style.display = "none";
    }

    window.location.href = "index.html";
}

function showWarningModal(){

    const modal =
    document.getElementById("warning-modal");

    if(modal){
        modal.style.display = "flex";
    }
}

function closeWarningModal(){

    const modal =
    document.getElementById("warning-modal");

    if(modal){
        modal.style.display = "none";
    }
}