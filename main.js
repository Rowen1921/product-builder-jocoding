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

document.getElementById('draw-button').addEventListener('click', () => {
    const lottoNumbersContainer = document.getElementById('lotto-numbers');
    lottoNumbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 7) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    [...numbers].forEach(number => {
        const lottoBall = document.createElement('lotto-ball');
        lottoBall.setAttribute('number', number);
        lottoNumbersContainer.appendChild(lottoBall);
    });
});
