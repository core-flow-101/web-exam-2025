
const apiKey = "5413a62a-f5ee-40e8-83c2-06cea2f6f996";
const baseURL = "https://edu.std-900.ist.mospolytech.ru"
const baseDeliveryCost = 200;

//Получение данных о товаре по ID
function fetchItemData(orderId) {
    const url = `${baseURL}/exam-2024-1/api/goods/${orderId}?api_key=${apiKey}`;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);

    try {
        xhr.send();
        if (xhr.status === 200) {
            return JSON.parse(xhr.responseText);
        } else {
            console.error(`Ошибка загрузки товара с ID ${orderId}: ${xhr.statusText}`);
            return null;
        }
    } catch (error) {
        console.error("Ошибка при выполнении запроса:", error);
        return null;
    }
}

//Отрисовка товаров в коризине
function renderCartItems() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartItemsContainer.innerHTML = "";

    let totalPrice = 0;

    for (const itemId of cart) {
        const item = fetchItemData(itemId);
        if (!item) {
            continue;
        }
        const card = document.createElement("div");
        card.className = "col";

        totalPrice += item.actual_price;

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
                    <button class="btn btn-danger w-100 remove-item" data-id="${itemId}">Удалить</button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(card);
    }

    updateTotalPrice(totalPrice);
}

//Обновление итоговой стоимости
function updateTotalPrice(itemsTotal) {
    const deliveryDate = document.getElementById("delivery-date").value;
    const deliveryTime = document.getElementById("delivery-time").value;
    const deliveryCost = calculateDeliveryCost(deliveryDate, deliveryTime);

    const totalPrice = itemsTotal + deliveryCost;


    document.getElementById("delivery-cost").textContent = deliveryCost;
    document.getElementById("total-price").textContent = totalPrice;
}

//Удаление товара из корзины
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-item")) {
        const itemId = parseInt(event.target.dataset.id, 10);
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart = cart.filter((id) => id !== itemId);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCartItems();
    }
});

//Оформление заказа
document.getElementById("place-order").addEventListener("click", () => {
    const fullName = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const deliveryDate = document.getElementById("delivery-date").value.trim();
    const deliveryInterval = document.getElementById("delivery-time").value.trim();
    const comment = document.getElementById("comment").value.trim();
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const formattedDate = formatDateToServer(deliveryDate);


    const orderData = {
        full_name: fullName,
        email: email,
        phone: phone,
        delivery_address: address,
        delivery_date: formattedDate,
        delivery_interval: deliveryInterval,
        comment: comment,
        good_ids: cart
    };

    console.log(orderData);
    createOrder(orderData);

});

//Создание заказа(Отправка POST запроса)
function createOrder(orderData) {
    const xhr = new XMLHttpRequest();
    const url = `${baseURL}/exam-2024-1/api/orders?api_key=${apiKey}`

    xhr.open("POST", url, false);
    xhr.setRequestHeader("Content-Type", "application/json");

    try {
        xhr.send(JSON.stringify(orderData));

        if (xhr.status === 200 || xhr.status === 201) {
            showNotification("Заказ успешно оформлен!", "success")
            localStorage.removeItem("cart");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        } else {
            console.error("Ошибка при оформлении заказа:", xhr.status, xhr.responseText);
            showNotification(`Ошибка при оформлении заказа: ${xhr.status}`, `danger`)

        }
    } catch (error) {
        console.error("Ошибка сети или сервера:", error);
        alert("Ошибка при отправке запроса. Проверьте соединение.");
    }
}

//Форматирование даты под нужный формат
function formatDateToServer(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}.${month}.${year}`;
}




//Очистка корзины
document.getElementById("reset-cart").addEventListener("click", () => {
    localStorage.removeItem("cart");
    renderCartItems();
});


function calculateDeliveryCost(deliveryDate, deliveryTime) {
    const date = new Date(deliveryDate);
    const dayOfWeek = date.getDay();

    let deliveryCost = baseDeliveryCost;


    if (deliveryTime.includes("18:00") || deliveryTime.includes("22:00")) {

        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            deliveryCost += 200;
        }
        else if (dayOfWeek === 0 || dayOfWeek === 6) {
            deliveryCost += 300;
        }
    }

    return deliveryCost;
}


// Перерасчет стоимости
function calculateAndUpdateTotal() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    let itemsTotal = 0;

    cart.forEach((itemId) => {
        const itemData = fetchItemData(itemId);
        if (itemData) {
            itemsTotal += itemData.discount_price;
        }
    });

    updateTotalPrice(itemsTotal);
}


// Обработчик событий для изменения времени доставки
document.getElementById("delivery-time").addEventListener("change", calculateAndUpdateTotal);

// Обработчик событий для изменения даты доставки
document.getElementById("delivery-date").addEventListener("change", calculateAndUpdateTotal);

// Инициализация 
document.addEventListener("DOMContentLoaded", () => {
    renderCartItems();
    calculateAndUpdateTotal();
});










