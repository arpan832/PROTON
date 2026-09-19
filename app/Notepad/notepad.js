const notepadIcon = document.getElementById('note-box');
const notepadPanel = document.getElementById('note-bigbox');
const notepadTextarea = document.getElementById('note-textarea');
const notepadClose = document.getElementById('note-close');
const notepadHeader = document.querySelector('.notepad-header');

if (!notepadPanel || !notepadTextarea) {
    console.warn('Notepad elements are not found, critical error')
}

// toggle logic 
function toggleNotepad() {
    // toggle class properly and update aria-hidden attribute
    notepadPanel.classList.toggle('open');
    const isOpen = notepadPanel.classList.contains('open');
    notepadPanel.setAttribute('aria-hidden', String(!isOpen));
    console.log('Notepad toggled:', isOpen);
}

if (notepadIcon) {
    notepadIcon.addEventListener('click', function (event) {
        toggleNotepad();
        event.stopPropagation();
    });
} else {
    console.warn('Notepad icon element not found');
}

if (notepadPanel) {
    const resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = 'position: absolute; bottom: 0; right: 0; width: 15px; height: 15px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #666 50%);';
    notepadPanel.appendChild(resizeHandle);

    let isResizing = false;
let  startX = 0;
let  startY = 0;
let  startWidth = 0;
let  startHeight = 0;

resizeHandle.addEventListener('mousedown', function (event) {
    isResizing = true;
    startX = event.clientX;
    startY = event.clientY;
    startWidth = notepadPanel.offsetWidth;
    startHeight = notepadPanel.offsetHeight;
    event.preventDefault();
  });

  document.addEventListener('mousemove', function (event) {
    if (!isResizing) return;
    const newWidth = startWidth + (event.clientX - startX);
    const newHeight = startHeight + (event.clientY - startY);
    if (newWidth > 200) notepadPanel.style.width = newWidth + 'px';
    if (newHeight > 150) notepadPanel.style.height = newHeight + 'px';
  });

  document.addEventListener('mouseup', function () {
    isResizing = false;
  });
}

// Dragging logic 


let isDragging = false;
let offsetX = 0;
let offsetY = 0;

function handleDragStart(clientX, clientY) {
    if (!notepadPanel.classList.contains('open')) return;
    isDragging = true;
    offsetX = clientX - notepadPanel.offsetLeft;
    offsetY = clientY - notepadPanel.offsetTop;
    if (notepadHeader) notepadHeader.style.cursor = 'grabbing';
}

function handleDragMove(clientX, clientY) {
    if (!isDragging) return;
    const left = clientX - offsetX;
    const top = clientY - offsetY;
    if (left >= 0) notepadPanel.style.left = left + 'px';
    if (top >= 0) notepadPanel.style.top = top + 'px';
    if (notepadHeader) notepadHeader.style.cursor = 'grabbing';
}

function handleDragEnd() {
  if (!isDragging) return;
  isDragging = false;
  if (notepadHeader) notepadHeader.style.cursor = 'grab';
}

function onMouseMove(event) {
  handleDragMove(event.clientX, event.clientY);
}

function onMouseUp() {
  handleDragEnd();
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}

// Close button handler
if (notepadClose) {
  notepadClose.addEventListener('click', function () {
    toggleNotepad();
  });
} else {
  console.warn('Notepad close button not found');
}

// Save button handler
const saveButton = document.getElementById('save-note');
if (saveButton) {
  saveButton.addEventListener('click', function () {
    if (notepadTextarea && notepadTextarea.value) {
      localStorage.setItem('notepad-content', notepadTextarea.value);
      console.log('Note saved successfully');
    }
  });
}

// Load saved note on page load
if (notepadTextarea) {
  const savedContent = localStorage.getItem('notepad-content');
  if (savedContent) {
    notepadTextarea.value = savedContent;
  }
}

if (notepadHeader && notepadPanel) {
  notepadHeader.addEventListener('mousedown', function (event) {
    if (event.target.closest('button')) return;
    handleDragStart(event.clientX, event.clientY);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    event.preventDefault();
  });

  notepadHeader.addEventListener('touchstart', function (event) {
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
