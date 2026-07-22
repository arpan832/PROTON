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

if(notepadIcon){
    notepadIcon.addEventListener('click', function(event){
        toggleNotepad();
        event.stopPropagation();
    });
}




