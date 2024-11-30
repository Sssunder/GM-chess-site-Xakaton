function showContent(contentId) {
    const contents = document.querySelectorAll('.content');
    let newContent = document.getElementById(contentId);

    if (newContent.classList.contains('active')) {
        return; // Если новый контент уже активен, ничего не делаем
    }

    // Проходим по всем элементам контента
    contents.forEach(content => {
        if (content === newContent) {
            // Если это новый контент, будем показывать его после завершения анимации исчезновения
            setTimeout(() => {
                content.classList.remove('fade-out'); // Убираем классы исчезновения
                content.classList.add('active'); // Добавляем класс для показа
                content.style.display = 'block'; // Убедимся в отображении
                content.offsetHeight; // Перезапуск анимации
            }, 500); // Время ожидания совпадает с анимацией исчезновения
        } else if (content.classList.contains('active')) {
            // Если это текущий активный контент, убираем его с анимацией
            content.classList.add('fade-out'); // Добавляем класс для исчезновения
            setTimeout(() => {
                content.classList.remove('active', 'fade-out'); // Убираем классы после анимации
                content.style.display = 'none'; // Скрываем элемент
            }, 500); // Время ожидания совпадает с анимацией
        }
    });
}

let lastScrollTop = 0; 
const header = document.querySelector('header');
const footer = document.querySelector('footer');
const footerHeight = 70; // Высота футера (например, 70px)

window.addEventListener('scroll', function() {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Проверяем, достигли ли максимальной прокрутки вниз
    if (currentScroll >= maxScroll) {
        // Показываем футер, скрываем хедер
        header.style.top = "-70px"; // Скрыть заголовок
        footer.style.bottom = "0"; // Показать футер
    } 
    // Проверяем, достигли ли максимальной прокрутки вверх
    else if (currentScroll === 0) {
        // Показываем хедер, скрываем футер
        header.style.top = "0"; // Показать заголовок
        footer.style.bottom = `-${footerHeight}px`; // Скрыть футер
    } 
    else {  
        header.style.top = "-70px"; // Скрыть заголовок
        footer.style.bottom = `-${footerHeight}px`; // Скрыть футер 
    }
    // Если текущая прокрутка между границами, ничего не делаем
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Для мобильных устройств или когда прокрутка на верх
});
