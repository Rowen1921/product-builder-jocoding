class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        const color = this.getColor(number);
        this.shadowRoot.innerHTML = `
            <style>
                .ball {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: white;
                    font-size: 1.5em;
                    font-weight: bold;
                    background-color: ${color};
                    border: 2px solid rgba(0,0,0,0.1);
                }
            </style>
            <div class="ball">${number}</div>
        `;
    }

    getColor(number) {
        const value = parseInt(number);
        if (value <= 10) return '#f44336';
        if (value <= 20) return '#ff9800';
        if (value <= 30) return '#ffc107';
        if (value <= 40) return '#4caf50';
        return '#2196f3';
    }
}

customElements.define('lotto-ball', LottoBall);

function saveHistory(numbers) {
    let history = JSON.parse(localStorage.getItem('lottoHistory')) || [];
    const now = new Date();
    const dateString = `${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;
    history.unshift({ date: dateString, numbers: numbers });
    if (history.length > 10) history = history.slice(0, 10); // Keep last 10 entries
    localStorage.setItem('lottoHistory', JSON.stringify(history));
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('lottoHistory')) || [];
    
    if (history.length === 0) {
        historyList.innerHTML = '<li style="text-align: center; color: #888;">기록이 없습니다.</li>';
        return;
    }

    history.forEach((item, index) => {
        const li = document.createElement('li');
        li.style.cssText = 'padding: 8px 10px 8px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;';
        
        const deleteBtn = document.createElement('span');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.style.cssText = 'color: #bbb; cursor: pointer; font-weight: bold; font-size: 1.2em; line-height: 1; transition: color 0.2s;';
        deleteBtn.title = '삭제';
        deleteBtn.onmouseover = () => deleteBtn.style.color = 'red';
        deleteBtn.onmouseout = () => deleteBtn.style.color = '#bbb';
        deleteBtn.onclick = () => deleteHistoryItem(index);
        
        const dateSpan = document.createElement('span');
        dateSpan.textContent = item.date;
        dateSpan.style.cssText = 'font-size: 0.8em; color: #666; width: 40px; flex-shrink: 0;';
        
        const numbersSpan = document.createElement('span');
        numbersSpan.textContent = item.numbers.join(', ');
        numbersSpan.style.cssText = 'font-weight: bold; flex-grow: 1; text-align: right;';

        li.appendChild(deleteBtn);
        li.appendChild(dateSpan);
        li.appendChild(numbersSpan);
        historyList.appendChild(li);
    });
}

function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem('lottoHistory')) || [];
    history.splice(index, 1);
    localStorage.setItem('lottoHistory', JSON.stringify(history));
    renderHistory();
}

document.getElementById('draw-button').addEventListener('click', () => {
    const lottoNumbersContainer = document.getElementById('lotto-numbers');
    lottoNumbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 7) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    
    const sortedNumbers = [...numbers]; // No sort for random display, or sortedNumbers.sort((a,b)=>a-b) if needed.
    // Usually lotto is sorted for easier reading, but request implies just history. Let's keep display order.

    sortedNumbers.forEach(number => {
        const lottoBall = document.createElement('lotto-ball');
        lottoBall.setAttribute('number', number);
        lottoNumbersContainer.appendChild(lottoBall);
    });

    saveHistory(sortedNumbers);
});

const historyButton = document.getElementById('history-button');
const historyModal = document.getElementById('history-modal');
const closeModalSpan = document.getElementById('close-modal');

historyButton.addEventListener('click', () => {
    renderHistory();
    historyModal.style.display = 'flex'; // Use flex to center with the updated CSS
});

closeModalSpan.addEventListener('click', () => {
    historyModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == historyModal) {
        historyModal.style.display = 'none';
    }
});

document.getElementById('clear-history').addEventListener('click', () => {
    if(confirm('모든 기록을 삭제하시겠습니까?')) {
        localStorage.removeItem('lottoHistory');
        renderHistory();
    }
});

const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.body.classList.add(currentTheme);
    if (currentTheme === 'dark-mode') {
        toggleSwitch.checked = true;
    }
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
     // Optional: check system preference if no local storage
     document.body.classList.add('dark-mode');
     toggleSwitch.checked = true;
}


function switchTheme(e) {
    if (e.target.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', ''); // Or 'light-mode' if you have one
    }
}

toggleSwitch.addEventListener('change', switchTheme, false);

// SNS Sharing
const shareUrl = encodeURIComponent(window.location.href);
const shareTitle = encodeURIComponent("로또 번호 추첨기 - 오늘의 행운 번호를 무료로 확인하세요!");

// [중요] 카카오톡 공유가 작동하려면 아래 단계를 수행해야 합니다:
// 1. https://developers.kakao.com/ 접속 및 로그인
// 2. '내 애플리케이션' -> '애플리케이션 추가하기'
// 3. 앱 설정 -> '플랫폼' -> 'Web' 플랫폼 등록 -> 사이트 도메인(https://rowen1921.github.io) 등록
// 4. 앱 키 -> 'JavaScript 키' 복사하여 아래 'YOUR_KAKAO_JS_KEY' 부분에 붙여넣기
const KAKAO_JS_KEY = 'c089c8172def97eb00c07217cae17495'; // 여기에 실제 키를 입력하세요.

// Initialize Kakao SDK
try {
    if (!Kakao.isInitialized()) {
        Kakao.init(KAKAO_JS_KEY);
    }
} catch(e) {
    console.warn("Kakao SDK init failed. Please check your API key and domain settings.");
}

document.getElementById('share-kakao').addEventListener('click', () => {
    if (!Kakao.isInitialized()) {
        alert('카카오톡 공유를 위해서는 개발자 키 설정이 필요합니다. main.js 파일을 확인해주세요.');
        return;
    }
    
    try {
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: '로또 번호 추첨기',
                description: '오늘의 행운 번호를 지금 확인해보세요!',
                imageUrl: 'https://rowen1921.github.io/product-builder-jocoding/og-image.png', // Update with actual image URL
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href,
                },
            },
            buttons: [
                {
                    title: '번호 뽑으러 가기',
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                },
            ],
        });
    } catch (err) {
        alert('카카오톡 공유 기능을 사용할 수 없습니다. (API 키 설정 필요)');
    }
});

document.getElementById('share-twitter').addEventListener('click', () => {
    window.open(`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`, '_blank');
});

document.getElementById('share-facebook').addEventListener('click', () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
});

document.getElementById('share-link').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('링크가 복사되었습니다!');
    }).catch(() => {
        alert('링크 복사에 실패했습니다.');
    });
});
