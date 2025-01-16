const apiKey = "5413a62a-f5ee-40e8-83c2-06cea2f6f996";
const baseURL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods";

//Добавление товараа в корзину
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("add-to-cart")) {

        const card = event.target.closest(".card");
        const itemId = parseInt(card.dataset.id, 10);

        if (!itemId) {
            alert("Ошибка: Невозможно добавить товар. Некорректный ID.");
            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.includes(itemId)) {
            showNotification("Товар уже добавлен в корзину!", "warning");
            return;
        }

        cart.push(itemId);

        localStorage.setItem("cart", JSON.stringify(cart));
        showNotification("Товар добавлен в корзину!", "success");

    }
});


//Загрузка товаров с сервера
function fetchGoodsSync() {
    const url = `${baseURL}?api_key=${apiKey}`;
    const xhr = new XMLHttpRequest();

    try {
        xhr.open("GET", url, false);
        xhr.send();

        if (xhr.status === 200) {
            return JSON.parse(xhr.responseText);
        } else {
            console.error(`Ошибка загрузки данных: ${xhr.statusText}`);
            return [];
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
        return [];
    }
}

//Отображние карточек
function displayGoods(goods) {
    const goodsList = document.getElementById("goods-list");
    goodsList.innerHTML = "";

    goods.forEach((item) => {
        const card = document.createElement("div");
        card.className = "col";

        card.innerHTML = `
            <div class="card h-100" data-id="${item.id}">
                <img src="${item.image_url}" class="card-img-top" alt="${item.name}">
                <div class="card-body">
                    <h5 class="card-title">${truncateText(item.name, 40)}</h5>
                    <p class="card-text">
                        Категория: ${item.main_category}<br>
                        Подкатегория: ${item.sub_category}<br>
                        Рейтинг: ${item.rating.toFixed(1)}
                    </p>
                    <p class="card-text">
                        Цена: <s>${item.actual_price} ₽</s> <strong>${item.discount_price} ₽</strong>
                    </p>
                    <button class="btn btn-primary w-100 mt-2 add-to-cart">Добавить</button>
                </div>
            </div>
        `;

        goodsList.appendChild(card);
    });
}




// Инициализация
function init() {
    const goods = fetchGoodsSync();
    displayGoods(goods);
}

document.addEventListener("DOMContentLoaded", () => {
    init();
});
