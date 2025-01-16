//Сокращение длинных названий
function truncateText(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}


//Отображение изображения
function showNotification(message, color) {
    const notification = document.getElementById("notification");
    notification.className = `alert alert-${color} alert-dismissible fade show`;
    notification.querySelector('strong').textContent = message;
    notification.classList.remove("d-none");


    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            notification.classList.add("d-none");
        }, 500);
    }, 3000);
}