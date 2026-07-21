// calculator page flex-box
const calculator = document.querySelector('.calculator')
const Borocalculator = document.getElementById("cal-bigbox");
const panel = document.querySelector('is-active')
const buttons = document.getElementById('Buttons')
const inputplace = document.querySelector('inputbutton')
//calculator-panel 
function calculatorpanel() {
  calculator.addEventListener('click', function () {
    Borocalculator.classList.toggle('is-active');
    inputplace.classList.toggle('inputactive')
  })
}
calculatorpanel();



// Resizing and panel logic 
panel.addEventListener('mousedown', (e) => {
  let offsetX = e.clientX - box.getBoundingClientRect().left;
  let offsetY = e.clientY - box.getBoundingClientRect().top;

  function moveBox(e) {
    box.style.left = (e.clientX - offsetX) + 'px';
    box.style.top = (e.clientY - offsetY) + 'px';
  }

  document.addEventListener('mousemove', moveBox);

  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', moveBox);
  }, { once: true });
});
moveBox();

//calculator UI:
function calcUI() {

}