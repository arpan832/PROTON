// calculator panel logic
const calculatorIcon = document.getElementById('cal-box');
const calculatorPanel = document.getElementById('cal-bigbox');
const calculatorScreen = document.getElementById('calc-screen');
const calculatorClose = document.getElementById('calc-close');

let currentValue = '0';
let storedValue = null;
let currentOperator = null;
let waitingForNextValue = false;

function updateDisplay() {
    calculatorScreen.textContent = currentValue;
}

function clearCalculator() {
    currentValue = '0';
    storedValue = null;
    currentOperator = null;
    waitingForNextValue = false;
    updateDisplay();
}

function inputDigit(digit) {
    if (waitingForNextValue) {
        currentValue = digit;
        waitingForNextValue = false;
    } else {
        currentValue = currentValue === '0' ? digit : currentValue + digit;
    }
    updateDisplay();
}

function inputDecimal() {
    if (waitingForNextValue) {
        currentValue = '0.';
        waitingForNextValue = false;
    } else if (!currentValue.includes('.')) {
        currentValue += '.';
    }
    updateDisplay();
}

function calculate(nextOperator) {
    const current = parseFloat(currentValue);
    const previous = storedValue === null ? current : parseFloat(storedValue);
    let result = previous;

    switch (currentOperator) {
        case '+':
            result = previous + current;
            break;
        case '-':
            result = previous - current;
            break;
        case '*':
            result = previous * current;
            break;
        case '/':
            result = current === 0 ? 'Error' : previous / current;
            break;
        default:
            result = current;
    }

    currentValue = String(result);
    storedValue = nextOperator ? currentValue : null;
    updateDisplay();
}

function handleOperator(operator) {
    const inputValue = parseFloat(currentValue);

    if (currentOperator && waitingForNextValue) {
        currentOperator = operator;
        return;
    }

    if (storedValue === null) {
        storedValue = inputValue;
    } else if (currentOperator) {
        calculate(operator);
    }

    currentOperator = operator;
    waitingForNextValue = true;
}

function handleEquals() {
    if (!currentOperator) {
        return;
    }
    calculate(null);
    currentOperator = null;
    waitingForNextValue = true;
}

function handlePercent() {
    currentValue = String(parseFloat(currentValue) / 100);
    updateDisplay();
}

calculatorIcon.addEventListener('click', function () {
    calculatorPanel.classList.add('open');
    calculatorPanel.setAttribute('aria-hidden', 'false');
});

calculatorClose.addEventListener('click', function () {
    calculatorPanel.classList.remove('open');
    calculatorPanel.setAttribute('aria-hidden', 'true');
});

calculatorPanel.addEventListener('click', function (event) {
    const target = event.target;
    if (target.tagName !== 'BUTTON') {
        return;
    }

    const action = target.dataset.action;
    const value = target.dataset.value;

    if (action === 'digit') {
        inputDigit(value);
        return;
    }

    if (action === 'decimal') {
        inputDecimal();
        return;
    }

    if (action === 'operator') {
        handleOperator(value);
        return;
    }

    if (action === 'equals') {
        handleEquals();
        return;
    }

    if (action === 'clear') {
        clearCalculator();
        return;
    }

    if (action === 'percent') {
        handlePercent();
        return;
    }
});

clearCalculator();
