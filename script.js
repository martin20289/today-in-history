const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const leftScroll = document.getElementsByClassName('left-scroll')[0];
const rightScroll = document.getElementsByClassName('right-scroll')[0];
const scrollBody = document.getElementsByClassName('scroll-body')[0];
const navTop = document.getElementsByClassName('navigation-top')[0];
const navBottom = document.getElementsByClassName('navigation-bottom')[0];
// const navLeft = document.getElementsByClassName('navigation-left')[0];
// const navRight = document.getElementsByClassName('navigation-right')[0];
const closeButton = document.getElementsByClassName('close-button')[0];
const openButton = document.getElementsByClassName('overlay')[0];
const slider = document.getElementsByClassName('time-slider')[0];
const progressBar = document.getElementsByClassName('progress-bar')[0];
const closingMessage = document.getElementsByClassName('closing')[0];
const display = document.getElementsByClassName('display')[0];
const displayContent = display.childNodes;
let imageIndex = 0;

const dayInHistory = {}
dayInHistory.host = 'http://history.muffinlabs.com';
dayInHistory.getToday = function() {
    const today = new Date();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    return [month, day];
}
dayInHistory.getHistory = async function() {
    const date = this.getToday();
    try {
        const promise = await fetch(proxyUrl+`${ this.host }/date/${ date[0] }/${ date[1] }`);
        const response = await promise.json();
        const events = response.data.Events;
        this.getEvent(events);
    } catch (err) {
        console.log(err);
    }
}
dayInHistory.getEvent = function(events) {
    let random = 0;
    events.forEach(event => {
        const eventDisplay = document.createElement('div');
        eventDisplay.classList.add('content-container');
        eventDisplay.innerHTML = this.getImage(event, random).outerHTML + this.getDescription(event).outerHTML;
        eventDisplay.classList.add('hidden');
        display.appendChild(eventDisplay);
    })
}
dayInHistory.getImage = function(event, random) {
    const imageContainer = document.createElement('div');
    const image = document.createElement('img');
    imageContainer.classList.add('image-container');
    random = this.randomImageIndex(random);
    const era = this.getEra(event.year, event.text, random);
    image.src = era[0];
    image.setAttribute('id', era[1]);
    imageContainer.appendChild(image);
    return imageContainer;
}
dayInHistory.getDescription = function(event) {
    const textContainer = document.createElement('div');
    const yearText = document.createElement('h2');
    const description = document.createElement('p');
    yearText.classList.add('content');
    description.classList.add('content');
    yearText.innerHTML = `Year ${ event.year }`;
    description.innerHTML = event.text;
    textContainer.classList.add('text-container');
    textContainer.innerHTML = yearText.outerHTML + description.outerHTML;
    return textContainer;
}
dayInHistory.randomImageIndex = function(prevNum) {
    let random = Math.floor(Math.random()*5 + 1);
    while (random === prevNum) {
        random = Math.floor(Math.random()*5 + 1);
    }
    return random;
}
dayInHistory.isWWI = function(text) {
    return text.toLowerCase().includes('world war 1') || text.toLowerCase().includes('ww1') || text.toLowerCase().includes('world war i') || text.toLowerCase().includes('wwi');
}
dayInHistory.isWWII = function(text) {
    return text.toLowerCase().includes('world war 2') || text.toLowerCase().includes('ww2') || text.toLowerCase().includes('world war ii') || text.toLowerCase().includes('wwii');
}
dayInHistory.getYearNumeral = function(year) { // convert 'BC' to negative
    let yearNumeral = parseInt(year);
    if (year.includes(' BC')) { 
        yearNumeral = -yearNumeral 
    }
    return yearNumeral;
}
dayInHistory.getEra = function(year, text, random) {
    let yearNumeral = this.getYearNumeral(year);
    let src = 'assets/';
    let keyword = '';
    if (yearNumeral < 500) {
        keyword = 'ancient';
    } else if (yearNumeral < 1500) {
        keyword = 'medieval';
    } else if (yearNumeral < 1700) {
        keyword = 'renaissance';    
    } else if (yearNumeral < 2000) {
        keyword = 'modern';
    } else {
        keyword = 'current';
    }
    src += `${ keyword + random }.jpg`;
    // attempts to make images content-aware
    if (this.isWWII(text)) {
        src = `assets/WW2.jpg`;
    } else if (this.isWWI(text)) {
        src = `assets/WW1.jpg`;
    }
    if (text.toLowerCase().includes('global warming')) {
        src = `assets/current5.jpg`;
    } else if (text.toLowerCase().includes('technology')) {
        src = `assets/current4.jpg`;
    }
    return [src, keyword];
}
dayInHistory.showEra = function(era) {
    for (let i = 0; i < 5; i++) {
        if (slider.children[i].classList[0] === era) {
            slider.children[i].classList.remove('hidden');
        } else { 
            slider.children[i].classList.add('hidden');
        }
    }
}
dayInHistory.init = function() {
    this.getHistory();
}

helperFunctions = {}
helperFunctions.initialized = false; // boolean value to initialize functions only once 
helperFunctions.animateNav = function() { // toggle padding to create animation
    let on = false;
    const top = document.getElementById('nav-top');
    const bot = document.getElementById('nav-bot');
    setInterval(() => {
        if (!on) {
            top.style.padding = '5px 0 0 0';
            bot.style.padding = '0 5px 0 0';
        } else {
            top.style.padding = '0';
            bot.style.padding = '0';
        }
        on = !on;
    }, 500);
}
helperFunctions.fillProgressBar = function(content) {
    let era;
    try { 
        era = content[imageIndex].childNodes[0].childNodes[0].getAttribute('id'); 
    } catch(err) {  }
    dayInHistory.showEra(era);
    progressBar.style.width = `${ 50 * imageIndex / content.length }vw`;   
}
helperFunctions.increaseIndex = function() {
    if (displayContent[imageIndex - 1]) { 
        displayContent[imageIndex - 1].classList.add('hidden'); 
    }
    if (!displayContent[imageIndex]) { 
        helperFunctions.close(); 
    } 
    helperFunctions.fillProgressBar(displayContent);
    try { 
        displayContent[imageIndex++].classList.remove('hidden'); 
    } catch(err) {  }
}
helperFunctions.decreaseIndex = function() {
    if (displayContent[imageIndex - 1]) { // prevent scrolling past 0
        try { 
            displayContent[imageIndex--].classList.add('hidden'); 
        } catch(err) {  }
        helperFunctions.fillProgressBar(displayContent);
        displayContent[imageIndex].classList.remove('hidden'); 
    }
}
helperFunctions.handleMouseScroll = function(element) {
    element.addEventListener('wheel', function(e) {
        if (display.classList.contains('ready')) {
            if (e.deltaY > 0) { // scroll down
                helperFunctions.increaseIndex();
            } else { //scroll up
                helperFunctions.decreaseIndex();
            }
        }
    });
}
// helperFunctions.handleNav = function(element) {
//     element.addEventListener('click', function() {
//         if (element.classList.contains('navigation-right')) { 
//             helperFunctions.increaseIndex();
//         } else {
//             helperFunctions.decreaseIndex();
//         }
//     });
// }
helperFunctions.handleKeyboard = function() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') {
            helperFunctions.increaseIndex();
        } else if (e.key === 'ArrowLeft') {
            helperFunctions.decreaseIndex();
        }
    });
}
helperFunctions.handleClick = function(element) { 
    element.addEventListener('click', function(e) {
        const progressBarLength = 0.5 * window.innerWidth;
        imageIndex = Math.floor(displayContent.length * (e.clientX - slider.offsetLeft) / progressBarLength);
        helperFunctions.fillProgressBar(displayContent);
        for (let i = 0; i < displayContent.length; i++) {
            if (i === imageIndex) {
                displayContent[i].classList.remove('hidden');
            } else {
                displayContent[i].classList.add('hidden');
            }
        }
    });
}
helperFunctions.handleCloseButton = function() {
    document.getElementsByClassName('close-button')[0].addEventListener('click', function() {
        helperFunctions.close();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            helperFunctions.close();
        }
    });
}
helperFunctions.handleOpenButton = function() {
    document.getElementsByClassName('overlay')[0].addEventListener('click', function() {
        helperFunctions.open();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            helperFunctions.open();
        }
    });
}
helperFunctions.open = function() {
    imageIndex = 0;
    leftScroll.classList.remove('close');
    leftScroll.classList.add('left-open');
    rightScroll.classList.remove('close');
    rightScroll.classList.add('right-open');
    scrollBody.classList.remove('hidden');
    slider.classList.add('revealed');
    display.classList.add('revealed');
    openButton.classList.add('hidden');
    setTimeout(function() {
        closeButton.classList.remove('hidden');
        navTop.classList.remove('hidden');
        navBottom.classList.remove('hidden');
        // navLeft.classList.remove('hidden');
        // navRight.classList.remove('hidden');
        displayContent[0].classList.remove('hidden');
        display.classList.add('ready');
        progressBar.classList.remove('hidden');
        progressBar.style.width = 0;
        dayInHistory.showEra(displayContent[0].childNodes[0].childNodes[0].getAttribute('id'));
        if (!helperFunctions.initialized) { // only initialize these functions once
            helperFunctions.initialized = true;
            helperFunctions.handleMouseScroll(display);
            helperFunctions.handleMouseScroll(slider);
            helperFunctions.handleMouseScroll(progressBar);
            helperFunctions.handleClick(slider);
            helperFunctions.handleClick(progressBar)
            // helperFunctions.handleNav(navLeft);
            // helperFunctions.handleNav(navRight);
            helperFunctions.animateNav();
            helperFunctions.handleCloseButton();
            helperFunctions.handleKeyboard();
        }
    }, 1000);    
}
helperFunctions.close = function() {
    closeButton.classList.add('hidden');
    navTop.classList.add('hidden');
    navBottom.classList.add('hidden');
    // navLeft.classList.add('hidden');
    // navRight.classList.add('hidden');
    leftScroll.classList.remove('left-open');
    leftScroll.classList.add('close');
    rightScroll.classList.remove('right-open');
    rightScroll.classList.add('close');
    progressBar.classList.add('hidden');
    display.classList.remove('ready');
    closingMessage.classList.add('revealed');
    setTimeout(function() {
        scrollBody.classList.add('hidden');
        slider.classList.remove('revealed');
        display.classList.remove('revealed'); 
    }, 850);
    setTimeout(function() { 
        openButton.classList.remove('hidden');
        for (let i = 0; i < 5; i++) { 
            slider.children[i].classList.add('hidden'); 
        }
        displayContent.forEach(event => { 
            if (!event.classList.contains('hidden')) { event.classList.add('hidden'); }
        });
    }, 1000);
}
helperFunctions.init = function() {
    this.handleOpenButton();
}


if (document.readyState === "complete") {
    helperFunctions.init();
    dayInHistory.init();
}
else {
    document.addEventListener("DOMContentLoaded", function() {
        helperFunctions.init();
        dayInHistory.init();
    });
}

