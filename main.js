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
                    background: radial-gradient(circle at 20px 20px, ${color}, #333);
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
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
