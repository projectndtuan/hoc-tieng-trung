// Biến toàn cục
let currentCardIndex = 0;
let filteredCards = [...vocabularyData];
let cardStatus = Array(vocabularyData.length).fill(0); // 0: chưa biết, 1: cần ôn, 2: đã biết
let isShuffled = false;
let isReverseMode = false;     // false: hiện từ, true: hiện nghĩa trước
let isChineseOnlyMode = false; // chỉ hiện chữ Hán

// DOM Elements
const chineseCharElement = document.getElementById('chinese-char');
const pinyinElement = document.getElementById('pinyin');
const meaningElement = document.getElementById('meaning');
const categoryElement = document.getElementById('category');
const flashcardElement = document.getElementById('flashcard');
const showMeaningButton = document.getElementById('show-meaning');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const progressTextElement = document.getElementById('progress-text');
const progressBarElement = document.getElementById('progress-bar');
const statsElement = document.getElementById('stats');
const categorySelectElement = document.getElementById('category-select');
const partSelectElement = document.getElementById('part-select');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const shuffleButton = document.getElementById('shuffle-btn');
const reverseModeButton = document.getElementById('reverse-mode-btn');
const chineseOnlyButton = document.getElementById('chinese-only-btn');

// Khởi tạo ứng dụng
function initApp() {
    showCard(currentCardIndex);
    updateStats();
    setupEventListeners();
}

// Hiển thị thẻ
function showCard(index) {
    if (filteredCards.length === 0) return;
    const card = filteredCards[index];

    if (isChineseOnlyMode) {
        // Chỉ chữ Hán
        chineseCharElement.textContent = card.chinese;
        pinyinElement.textContent = "";
        meaningElement.textContent = card.pinyin + " - " + card.meaning; // hiện pinyin + nghĩa ở mặt sau
        categoryElement.textContent = categoryNames[card.category];

        flashcardElement.classList.remove('reversed');

    } else if (isReverseMode) {
        // Nghĩa trước
        chineseCharElement.textContent = "?";
        pinyinElement.textContent = "";
        meaningElement.textContent = card.meaning;
        categoryElement.textContent = categoryNames[card.category];
        flashcardElement.classList.add('reversed');

    } else {
        // Bình thường
        chineseCharElement.textContent = card.chinese;
        pinyinElement.textContent = card.pinyin;
        meaningElement.textContent = card.meaning;
        categoryElement.textContent = categoryNames[card.category];
        flashcardElement.classList.remove('reversed');
    }

    flashcardElement.classList.remove('flipped');
    progressTextElement.textContent = `Thẻ ${index + 1}/${filteredCards.length}`;
    progressBarElement.style.width = `${((index + 1) / filteredCards.length) * 100}%`;

    prevButton.disabled = index === 0;
    nextButton.disabled = index === filteredCards.length - 1;
}

// Cập nhật thống kê
function updateStats() {
    const knownCount = cardStatus.filter(status => status === 2).length;
    const reviewCount = cardStatus.filter(status => status === 1).length;
    const unknownCount = cardStatus.filter(status => status === 0).length;
    statsElement.textContent = `Đã biết: ${knownCount} | Cần ôn: ${reviewCount} | Chưa biết: ${unknownCount}`;
}

// Lọc thẻ
function filterCards() {
    const selectedCategory = categorySelectElement.value;
    const selectedPart = partSelectElement.value;

    filteredCards = vocabularyData.filter(card => {
        const categoryMatch = selectedCategory === 'all' || card.category === selectedCategory;
        const partMatch = selectedPart === 'all' || card.part === selectedPart;
        return categoryMatch && partMatch;
    });

    currentCardIndex = 0;
    showCard(currentCardIndex);

    if (isShuffled) {
        isShuffled = false;
        shuffleButton.textContent = "Xáo trộn thẻ";
    }
}

// Xáo trộn
function shuffleCards() {
    for (let i = filteredCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]];
    }
    currentCardIndex = 0;
    showCard(currentCardIndex);
    isShuffled = true;
    shuffleButton.textContent = "Sắp xếp lại";
}

function sortCards() {
    filterCards();
    isShuffled = false;
    shuffleButton.textContent = "Xáo trộn thẻ";
}

// Chuyển chế độ
function toggleReverseMode() {
    isReverseMode = !isReverseMode;
    isChineseOnlyMode = false; // tắt nếu đang bật
    reverseModeButton.textContent = isReverseMode ? "Chế độ đảo ngược (ON)" : "Chế độ thường";
    chineseOnlyButton.textContent = "Chỉ chữ Hán";
    showCard(currentCardIndex);
}

// Thiết lập sự kiện
function setupEventListeners() {
    // Hiện nghĩa
    showMeaningButton.addEventListener('click', () => {
        flashcardElement.classList.add('flipped');
        if (isReverseMode) {
            const card = filteredCards[currentCardIndex];
            chineseCharElement.textContent = card.chinese;
            pinyinElement.textContent = card.pinyin;
        }
    });

    // Điều hướng
    prevButton.addEventListener('click', () => {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            showCard(currentCardIndex);
        }
    });
    nextButton.addEventListener('click', () => {
        if (currentCardIndex < filteredCards.length - 1) {
            currentCardIndex++;
            showCard(currentCardIndex);
        }
    });

    // Đánh giá độ khó
    difficultyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const difficulty = e.target.dataset.difficulty;
            const originalIndex = vocabularyData.findIndex(
                card => card.chinese === filteredCards[currentCardIndex].chinese
            );

            if (difficulty === 'easy') {
                cardStatus[originalIndex] = 2;
                if (isReverseMode) {
                    const card = filteredCards[currentCardIndex];
                    chineseCharElement.textContent = card.chinese;
                    pinyinElement.textContent = card.pinyin;
                }
                flashcardElement.classList.add('flipped');
                setTimeout(() => {
                    flashcardElement.classList.remove('flipped');
                    setTimeout(() => {
                        if (currentCardIndex < filteredCards.length - 1) {
                            currentCardIndex++;
                            showCard(currentCardIndex);
                        } else if (filteredCards.length > 0) {
                            currentCardIndex = 0;
                            showCard(currentCardIndex);
                        }
                    }, 300);
                }, 1000);
            } else if (difficulty === 'medium') {
                cardStatus[originalIndex] = 1;
                if (currentCardIndex < filteredCards.length - 1) {
                    currentCardIndex++;
                    showCard(currentCardIndex);
                }
            } else {
                cardStatus[originalIndex] = 0;
                if (currentCardIndex < filteredCards.length - 1) {
                    currentCardIndex++;
                    showCard(currentCardIndex);
                }
            }
            updateStats();
        });
    });

    // Lọc
    categorySelectElement.addEventListener('change', filterCards);
    partSelectElement.addEventListener('change', filterCards);

    // Xáo trộn
    shuffleButton.addEventListener('click', () => {
        if (isShuffled) {
            sortCards();
        } else {
            shuffleCards();
        }
    });

    // Chế độ đảo ngược
    reverseModeButton.addEventListener('click', toggleReverseMode);

    // Chế độ chỉ chữ Hán
    chineseOnlyButton.addEventListener('click', () => {
        isChineseOnlyMode = !isChineseOnlyMode;
        isReverseMode = false; // tắt nếu đang bật
        chineseOnlyButton.textContent = isChineseOnlyMode ? "Chỉ chữ Hán (ON)" : "Chỉ chữ Hán";
        reverseModeButton.textContent = "Chế độ thường";
        showCard(currentCardIndex);
    });
}

// Khởi chạy
document.addEventListener('DOMContentLoaded', initApp);
