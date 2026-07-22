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
    console.log(isOpen);
}

if (notepadIcon) {
    notepadIcon.addEventListener('click', function (event) {
        toggleNotepad();
        event.stopPropagation();
    });
}
if (notepadPanel) {
    const resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = 'position: absolute; bottom: 0; right: 0; width: 15px; height: 15px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #666 50%);';
    calculatorPanel.appendChild(resizeHandle);
}

let  isResizing = false ;
let  startX = 0;
let  startY = 0;
let  startWidth = 0;
let  startHeight = 0;

resize



