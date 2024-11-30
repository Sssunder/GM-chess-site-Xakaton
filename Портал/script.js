//import { Chess } from 'chess.js'

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

//стокфиш
// Создаем шахматную доску
const board = ChessBoard('board', {
    draggable: true,
    position: 'start',
    onDrop: handleMove,
});

// Инициализация шахматного движка Stockfish
const stockfish = new Worker('scr/stockfish.js'); // Используем CDN
let game = new Chess(); // Создаем новую игру
let isGameOver = false;
let executedMoves = []; // Массив для хранения выполненных ходов
// Инициализация Stockfish
stockfish.postMessage('uci');

stockfish.onmessage = function(event) {
    const message = event.data;

    if (message.includes('uciok')) {
        console.log('Stockfish инициализирован');
        makeBestMove();
    } else if (message.includes('bestmove')) {
        const bestMove = message.split(' ')[1];
        console.log('Лучший ход:', bestMove);

        // Проверяем текущее состояние FEN и доступные ходы перед выполнением
        console.log('Текущее состояние FEN:', game.fen());
        console.log('Доступные ходы:', game.moves());

        // Применяем лучший ход к игре только если это ваш ход
        if (game.turn() === 'w') { // Проверяем, что сейчас ход черных
            const from = bestMove.substring(0, 2);
            const to = bestMove.substring(2, 4);
            const move = game.move({ from: from, to: to });

            if (move) {
                executedMoves.push(bestMove); // Добавляем ход в выполненные
                board.position(game.fen()); // Обновляем визуальное представление доски
                // Проверяем, окончена ли игра
                if (game.game_over()) {
                    isGameOver = true;
                    alert('Игра окончена!');
                }
            } else {
                console.log('Недопустимый ход:', bestMove);
                // Если ход недопустим, запрашиваем следующий ход
                makeBestMove();
            }
        } else {
            console.log('Не ваш ход, пропускаем выполнение:', bestMove);
        }

        // Запрашиваем следующий ход у Stockfish после выполнения или пропуска
        makeBestMove();
    }
};

// Функция для запроса лучшего хода у Stockfish
function makeBestMove() {
    if (isGameOver) return; // Если игра окончена, не запрашиваем ход
    stockfish.postMessage('position ' + game.fen()); // Передаем текущее состояние игры
    stockfish.postMessage('go movetime 2000'); // Запрашиваем ход
}

// Функция для фильтрации недопустимых ходов
function filterInvalidMoves(moves) {
    return moves.filter(move => !executedMoves.includes(move));
}
// Функция для обработки перемещения фигур
function handleMove(source, target) {
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Промоция пешки
    });

    if (move === null) return 'snapback'; // Если ход недопустим, возвращаем фигуру назад

    board.position(game.fen()); // Обновляем доску

    if (game.game_over()) {
        isGameOver = true;
        alert('Игра окончена!');
    } else {
        makeBestMove(); // Запрашиваем ход у Stockfish
    }
}

// Запуск игры
function startGame() {
    game = new Chess(); // Создаем новую игру
    board.start(); // Сбрасываем доску
    isGameOver = false; // Сбрасываем состояние игры
    makeBestMove(); // Запрашиваем первый ход у Stockfish
}