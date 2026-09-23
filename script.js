// BOOT LOGIC =====
let TxtType = function(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
    };

    TxtType.prototype.tick = function() {
        let i = this.loopNum % this.toRotate.length;
        let  fullTxt = this.toRotate[i];

        if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

        let  that = this;
        let  delta = 200 - Math.random() * 100;

        if (this.isDeleting) { delta /= 2; }

        if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
        }

        setTimeout(function() {
        that.tick();
        }, delta);
    }; // BOOT LOGIC ENDS HERE 
    

    window.onload = function() {
        let  elements = document.getElementsByClassName('typewrite');
        for (let i=0; i<elements.length; i++) {
            let  toRotate = elements[i].getAttribute('data-type');
            let  period = elements[i].getAttribute('data-period');
            if (toRotate) {
              new TxtType(elements[i], JSON.parse(toRotate), period);
            }
        }
        // INJECT CSS
        let  css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
        document.body.appendChild(css);
    };

// CLOCK LOGIC ====
const Desktop = document.getElementById("Desktop");
const bootScreen = document.getElementById("boot-screen");
const texty = document.querySelector(".typewrite");
const clock = document.getElementById("clock");
const Dati = document.getElementById('Dati');
const bootVideo = document.getElementById('boot-video');
const welcome = document.getElementById('boot-welcome');
const welcomeDismiss = document.getElementById('boot-welcome-dismiss');
let hasEntered = false;
let welcomeTimer;

if (bootVideo) {
    bootVideo.addEventListener('error', () => {
        bootScreen?.classList.add('boot-video-failed');
    });
}

function dismissWelcome() {
    if (!welcome) return;
    welcome.classList.remove('is-visible');
    welcome.setAttribute('aria-hidden', 'true');
    clearTimeout(welcomeTimer);
}

function showDesktop() {
    if (!Desktop || !bootScreen || hasEntered) return;
    hasEntered = true;

    // The first user gesture unlocks audible playback in modern browsers.
    if (window.SpidyAudio) {
        window.SpidyAudio.loadTrack(window.SPIDY_AUDIO_TRACKS?.intro);
        window.SpidyAudio.enableSoundForUserGesture?.();
        window.SpidyAudio.play().catch((error) => {
            console.warn('Intro audio could not be started:', error.message || error);
        });
    }

    if (bootVideo) {
        bootVideo.pause();
        bootVideo.currentTime = bootVideo.currentTime || 0;
    }
    bootScreen.classList.add('is-dismissed');
    Desktop.classList.remove('Hidden');
    Desktop.style.display = "block";
    if (clock) clock.style.display = "block";
    if (Dati) {
        Dati.style.display = "block";
        Dati.style.color = "white";
    }

    if (welcome) {
        welcome.classList.add('is-visible');
        welcome.setAttribute('aria-hidden', 'false');
        welcomeTimer = setTimeout(dismissWelcome, 6000);
    }
}

// SCREEN CHANGE LOGIC ====
if (bootScreen) bootScreen.addEventListener('click', showDesktop);
if (bootScreen) bootScreen.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showDesktop();
    }
});
if (welcomeDismiss) welcomeDismiss.addEventListener('click', dismissWelcome);
if (welcome) welcome.addEventListener('click', (event) => {
    if (event.target === welcome) dismissWelcome();
});

function time(){
    const now = new Date();
    if (clock) clock.innerText = now.toLocaleTimeString();
    if (Dati) Dati.innerText = now.toLocaleDateString();

}
time();
setInterval(time,1000);








