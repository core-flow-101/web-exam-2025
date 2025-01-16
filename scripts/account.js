const apiKey = "5413a62a-f5ee-40e8-83c2-06cea2f6f996";
const baseURL = "https://edu.std-900.ist.mospolytech.ru";

document.addEventListener("DOMContentLoaded", () => {
    fetchOrders();
});

//Загрузка заказов
function fetchOrders() {
    const xhr = new XMLHttpRequest();
    const apiUrl = `${baseURL}/exam-2024-1/api/orders?api_key=${apiKey}`;
    xhr.open("GET", apiUrl, false);
    xhr.send();

    if (xhr.status === 200) {
        const orders = JSON.parse(xhr.responseText);
        renderOrders(orders);
    } else {
        console.error(`Ошибка загрузки заказов: ${xhr.status} - ${xhr.statusText}`);
        alert("Не удалось загрузить заказы. Попробуйте позже.");
    }
}

//Отрисовка студента
function renderOrders(orders) {
    const tbody = document.querySelector("table.table tbody");
    tbody.innerHTML = "";

    orders.forEach((order, index) => {
        const orderRow = document.createElement("tr");

        let totalOrderPrice = 0;


        const productNames = order.good_ids
            .map((id) => {
                const product = fetchGoodById(id);
                if (product) {
                    totalOrderPrice += product.discount_price; // Суммируем цены товаров
                    return truncateText(product.name, 30); // Сокращаем название до 30 символов
                }
                return `Товар ${id}`;
            })
            .join(", ");

        orderRow.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatDateTime(order.created_at)}</td>
            <td>${productNames}</td>
            <td>${totalOrderPrice} ₽</td> <!-- Выводим общую сумму заказа -->
            <td>${formatDateTime(order.delivery_date)} ${order.delivery_interval}</td>
            <td>
                <button class="btn btn-light" data-bs-toggle="modal" data-bs-target="#viewModal" data-order-id="${order.id}">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn btn-light btn-edit" data-bs-toggle="modal" data-bs-target="#editModal" data-order-id="${order.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-light" data-bs-toggle="modal" data-bs-target="#deleteModal" data-order-id="${order.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(orderRow);
    });


    document.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", () => {
            const orderId = btn.getAttribute("data-order-id");
            openEditModal(orderId);
        });
    });
}

//Загрузка товара по ID
function fetchGoodById(id) {
    const xhr = new XMLHttpRequest();
    const apiUrl = `${baseURL}/exam-2024-1/api/goods/${id}?api_key=${apiKey}`;
    xhr.open("GET", apiUrl, false);
    xhr.send();

    console.log(`Запрос для товара ${id}:`, apiUrl);

    if (xhr.status >= 200 && xhr.status < 300) {
        const product = JSON.parse(xhr.responseText);
        return product;
    } else {
        console.error(`Ошибка при запросе товара ${id}: ${xhr.status} ${xhr.statusText}`);
        return null;
    }
}

//Форматирование даты
function formatDateTime(date) {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("ru-RU");
}



//МЕХАНИКА УДАЛЕНИЯ 

// Удаление заказа
function deleteOrder(orderId) {
    const xhr = new XMLHttpRequest();
    const apiUrl = `${baseURL}/exam-2024-1/api/orders/${orderId}?api_key=${apiKey}`;
    xhr.open("DELETE", apiUrl, false);
    xhr.send();

    if (xhr.status === 200) {
        fetchOrders();
        const modal = bootstrap.Modal.getInstance(document.getElementById("deleteModal"));
        modal.hide();
    } else {
        alert("Не удалось удалить заказ. Попробуйте позже.");
    }
}


//Событие открытие модального окна удаления
document.getElementById("deleteModal").addEventListener("show.bs.modal", (event) => {
    const button = event.relatedTarget;
    const orderId = button.getAttribute("data-order-id");
    const confirmDeleteButton = document.querySelector("#deleteModal .btn-danger");
    confirmDeleteButton.setAttribute("data-order-id", orderId);
});

//Событие подтверждения удаления
document.querySelector("#delete-btn").addEventListener("click", (event) => {
    const orderId = event.target.getAttribute("data-order-id");
    deleteOrder(orderId);
});


//ПРОСМОТР ИНФЫ О ЗАКАЗЕ 

//Событие открытие модального окна просмотра
document.getElementById("viewModal").addEventListener("show.bs.modal", (event) => {
    const button = event.relatedTarget;
    const orderId = button.getAttribute("data-order-id");

    const modalBody = document.querySelector("#viewModal .modal-body");
    let totalOrderPrice = 0;

    const order = fetchOrderById(orderId);

    if (order) {
        const productNames = order.good_ids
            .map((id) => {
                const product = fetchGoodById(id);
                totalOrderPrice += product.discount_price; // Суммируем цены товаров
                return truncateText(product.name, 30);
            })
            .join(",  ");

        modalBody.innerHTML = `
            <div><strong>Дата оформления:</strong> ${formatDateTime(order.created_at)}</div>
            <div><strong>Имя:</strong> ${order.full_name}</div>
            <div><strong>Номер телефона:</strong> ${order.phone}</div>
            <div><strong>Email:</strong> ${order.email}</div>
            <div><strong>Адрес доставки:</strong> ${order.delivery_address}</div>
            <div><strong>Дата доставки:</strong> ${formatDateTime(order.delivery_date)}</div>
            <div><strong>Время доставки:</strong> ${order.delivery_interval}</div>
            <div><strong>Состав заказа:</strong> ${productNames}</div>
            <div><strong>Стоимость:</strong> ${totalOrderPrice} ₽</div>
            <div><strong>Комментарий:</strong> ${order.comment || "Отсутствует"}</div>
        `;
    } else {
        modalBody.innerHTML = "<div class='text-danger'>Не удалось загрузить данные о заказе.</div>";
    }
});


//РЕДАКТИРОВАНИЕ ЗАКАЗА

//Получение данных заказа по ID
function fetchOrderById(orderId) {
    const xhr = new XMLHttpRequest();
    const apiUrl = `${baseURL}/exam-2024-1/api/orders/${orderId}?api_key=${apiKey}`;
    xhr.open("GET", apiUrl, false);
    xhr.send();

    if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
    } else {
        console.error(`Ошибка загрузки заказа ${orderId}: ${xhr.status} - ${xhr.statusText}`);
        return null;
    }
}




//Открытие модального окна редактирования
function openEditModal(orderId) {
    const xhr = new XMLHttpRequest();
    const apiUrl = `${baseURL}/exam-2024-1/api/orders/${orderId}?api_key=${apiKey}`;
    xhr.open("GET", apiUrl, false);
    xhr.send();

    if (xhr.status === 200) {
        const order = JSON.parse(xhr.responseText);
        fillEditModal(order);
    } else {
        showNotification("Не удалось загрузить данные заказа.", "danger");
    }
}


// Заполнение модального окна редактирования данными
function fillEditModal(order) {
    let totalOrderPrice = 0;
    const productNames = order.good_ids
        .map((id) => {
            const product = fetchGoodById(id);
            if (product) {
                totalOrderPrice += product.discount_price;
                return truncateText(product.name, 30);
            }
            return `Товар ${id}`;
        })
        .join("\n");

    document.getElementById("editOrderDate").value = formatDateTime(order.created_at);
    document.getElementById("editName").value = order.full_name || "";
    document.getElementById("editPhone").value = order.phone || "";
    document.getElementById("editEmail").value = order.email || "";
    document.getElementById("editAddress").value = order.delivery_address || "";
    document.getElementById("editDeliveryDate").value = order.delivery_date || "";
    document.getElementById("editDeliveryTime").value = order.delivery_interval || "";
    document.getElementById("editCost").value = `${totalOrderPrice}₽`;
    document.getElementById("editOrderContent").value = productNames;
    document.getElementById("editComment").value = order.comment || "";


    const saveButton = document.querySelector("#editModal .btn-primary");
    saveButton.onclick = () => saveOrderChanges(order.id);
}


// Сохранение изменений 
function saveOrderChanges(orderId) {
    const updatedOrder = {
        full_name: document.getElementById("editName").value,
        phone: document.getElementById("editPhone").value,
        email: document.getElementById("editEmail").value,
        delivery_address: document.getElementById("editAddress").value,
        delivery_date: document.getElementById("editDeliveryDate").value,
        delivery_interval: document.getElementById("editDeliveryTime").value,
        comment: document.getElementById("editComment").value,
    };

    const xhr = new XMLHttpRequest();
    const apiUrl = `${baseURL}/exam-2024-1/api/orders/${orderId}?api_key=${apiKey}`;
    xhr.open("PUT", apiUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            showNotification("Заказ успешно обновлён.", "success");
            fetchOrders();
            const editModal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
            editModal.hide();

        } else {
            console.error(`Ошибка обновления заказа: ${xhr.status}`);
            showNotification("Ошибка обновления заказа.", "danger");
        }
    };
    xhr.send(JSON.stringify(updatedOrder));
}





