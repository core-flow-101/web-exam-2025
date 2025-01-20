const apiKey = "5413a62a-f5ee-40e8-83c2-06cea2f6f996";
const baseURL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods";
let currentPage = 1;
let totalPages = 1;
let perPage = 9;
let selectedSortOrder = "rating_desc";

// Инициализация
function init() {
    fetchGoods(currentPage, selectedSortOrder);
}

document.addEventListener("DOMContentLoaded", () => {
    init();
    const filterSelect = document.getElementById("filterSelect");
    filterSelect.addEventListener("change", handleFilterChange);
});


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

// Загрузка товаров с сервера с пагинацией и сортировкой
function fetchGoods(page, sortOrder) {
    const url = `${baseURL}?api_key=${apiKey}&page=${page}&per_page=${perPage}&sort_order=${sortOrder}`;
    const xhr = new XMLHttpRequest();

    try {
        // Синхронный запрос
        xhr.open("GET", url, false);
        xhr.send();

        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            totalPages = Math.ceil(response._pagination.total_count / perPage);
            displayGoods(response.goods);
            updatePagination();
        } else {
            console.error(`Ошибка загрузки данных: ${xhr.statusText}`);
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
    }
}


// Отображение товаров
function displayGoods(goods) {
    const goodsList = document.getElementById("goods-list");
    goodsList.innerHTML = "";

    goods.forEach((item) => {
        const card = document.createElement("div");
        card.className = "col";

        let priceHTML = `<strong>${item.actual_price} ₽</strong>`; // По умолчанию показываем оригинальную цену

        // Проверка наличия скидки
        if (item.discount_price && item.discount_price < item.actual_price) {
            priceHTML = `
                <s>${item.actual_price} ₽</s>
                <strong>${item.discount_price} ₽</strong>
            `;
        }

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
                        Цена: ${priceHTML}
                    </p>
                    <button class="btn btn-primary w-100 mt-2 add-to-cart">Добавить</button>
                </div>
            </div>
        `;
        goodsList.appendChild(card);
    });
}


//Обновление пагинации
function updatePagination() {
    const paginationNav = document.getElementById("paginationNav");
    paginationNav.innerHTML = '';


    if (currentPage > 1) {
        const prevButton = document.createElement("li");
        prevButton.className = "page-item";
        prevButton.innerHTML = `<a class="page-link" href="#">Предыдущая</a>`;
        prevButton.onclick = () => loadPage(currentPage - 1);
        paginationNav.appendChild(prevButton);
    }


    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("li");
        pageButton.className = `page-item ${i === currentPage ? "active" : ""}`;
        pageButton.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageButton.onclick = () => loadPage(i);
        paginationNav.appendChild(pageButton);
    }


    if (currentPage < totalPages) {
        const nextButton = document.createElement("li");
        nextButton.className = "page-item";
        nextButton.innerHTML = `<a class="page-link" href="#">Следующая</a>`;
        nextButton.onclick = () => loadPage(currentPage + 1);
        paginationNav.appendChild(nextButton);
    }
}

//Перезагрузка товаров при изменении страницы
function loadPage(page) {
    currentPage = page;
    fetchGoods(currentPage, selectedSortOrder);
}

// Обработчик изменения сортировки
function handleFilterChange(event) {
    selectedSortOrder = event.target.value;
    currentPage = 1;
    fetchGoods(currentPage, selectedSortOrder);
}


