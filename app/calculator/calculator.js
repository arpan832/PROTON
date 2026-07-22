// calculator panel logic
const calculatorIcon = document.getElementById('cal-box');
const calculatorPanel = document.getElementById('cal-bigbox');
const calculatorScreen = document.getElementById('calc-screen');
const calculatorClose = document.getElementById('calc-close');
const calculatorHeader = document.querySelector('.calculator-header');

// guard missing elements to avoid runtime errors
if (!calculatorPanel || !calculatorScreen) {
  console.warn('Calculator elements not found. Aborting calculator setup.');
}

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
  waitingForNextValue = true;
  updateDisplay();
}

function handlePlusMinus() {
  if (currentValue === '0' || currentValue === 'Error') {
    return;
  }
  currentValue = String(parseFloat(currentValue) * -1);
  updateDisplay();
}

function showCalculator() {
  calculatorPanel.classList.add('open');
  calculatorPanel.setAttribute('aria-hidden', 'false');
}

function hideCalculator() {
  calculatorPanel.classList.remove('open');
  calculatorPanel.setAttribute('aria-hidden', 'true');
}

function toggleCalculator() {
  calculatorPanel.classList.toggle('open');
  const isOpen = calculatorPanel.classList.contains('open');
  calculatorPanel.setAttribute('aria-hidden', String(!isOpen));
}

if (calculatorPanel) {
  calculatorPanel.addEventListener('click', function (event) {
    // support clicks on child elements inside buttons
    const button = event.target.closest('button');
    if (!button || !calculatorPanel.contains(button)) return;

    const action = button.dataset.action;
    // fallback to button text if data-value not provided
    const value = button.dataset.value ?? button.textContent.trim();

    if (action === 'digit') { inputDigit(value); return; }
    if (action === 'decimal') { inputDecimal(); return; }
    if (action === 'operator') { handleOperator(value); return; }
    if (action === 'equals') { handleEquals(); return; }
    if (action === 'clear') { clearCalculator(); return; }
    if (action === 'percent') { handlePercent(); return; }
    if (action === 'plusminus') { handlePlusMinus(); return; }
  });
}

clearCalculator();
// calculator panel toggle logic
if (calculatorIcon && calculatorPanel) {
  calculatorIcon.addEventListener('click', function (event) {
    toggleCalculator();
    event.stopPropagation();
  });

  if (calculatorClose) {
    calculatorClose.addEventListener('click', function (event) {
      hideCalculator();
      event.stopPropagation();
    });
  }

  document.addEventListener('click', function (event) {
    if (!calculatorPanel.contains(event.target) && !calculatorIcon.contains(event.target)) {
      hideCalculator();
    }
  });
}

// draggable logic
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

function handleDragStart(clientX, clientY) {
  if (!calculatorPanel.classList.contains('open')) return;
  isDragging = true;
  offsetX = clientX - calculatorPanel.offsetLeft;
  offsetY = clientY - calculatorPanel.offsetTop;
  if (calculatorHeader) calculatorHeader.style.cursor = 'grabbing';
}

function handleDragMove(clientX, clientY) {
  if (!isDragging) return;
  calculatorPanel.style.left = Math.max(0, clientX - offsetX) + 'px';
  calculatorPanel.style.top = Math.max(0, clientY - offsetY) + 'px';
}

function handleDragEnd() {
  if (!isDragging) return;
  isDragging = false;
  if (calculatorHeader) calculatorHeader.style.cursor = 'move';
}

function onMouseMove(event) {
  handleDragMove(event.clientX, event.clientY);
}

function onMouseUp() {
  handleDragEnd();
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}

if (calculatorHeader && calculatorPanel) {
  calculatorHeader.addEventListener('mousedown', function (event) {
    if (event.target.closest('button')) return;
    handleDragStart(event.clientX, event.clientY);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    event.preventDefault();
  });

  calculatorHeader.addEventListener('touchstart', function (event) {
    const touch = event.touches[0];
    if (!touch) return;
    handleDragStart(touch.clientX, touch.clientY);
    window.addEventListener('touchmove', function touchMove(e) {
      const moveTouch = e.touches[0];
      if (!moveTouch) return;
      handleDragMove(moveTouch.clientX, moveTouch.clientY);
    }, { passive: false });
    window.addEventListener('touchend', function touchEnd() {
      handleDragEnd();
    });
    event.preventDefault();
  });
}

// resizable logic
if (calculatorPanel) {
  const resizeHandle = document.createElement('div');
  resizeHandle.style.cssText = 'position: absolute; bottom: 0; right: 0; width: 15px; height: 15px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #666 50%);';
  calculatorPanel.appendChild(resizeHandle);

  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  resizeHandle.addEventListener('mousedown', function (event) {
    isResizing = true;
    startX = event.clientX;
    startY = event.clientY;
    startWidth = calculatorPanel.offsetWidth;
    startHeight = calculatorPanel.offsetHeight;
    event.preventDefault();
  });

  document.addEventListener('mousemove', function (event) {
    if (!isResizing) return;
    const newWidth = startWidth + (event.clientX - startX);
    const newHeight = startHeight + (event.clientY - startY);
    if (newWidth > 200) calculatorPanel.style.width = newWidth + 'px';
    if (newHeight > 150) calculatorPanel.style.height = newHeight + 'px';
  });

  document.addEventListener('mouseup', function () {
    isResizing = false;
  });
}