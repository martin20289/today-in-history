const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

const scroll = {}
scroll.leftScroll = document.getElementsByClassName('left-scroll')[0];
scroll.rightScroll = document.getElementsByClassName('right-scroll')[0];
scroll.scrollBody = document.getElementsByClassName('scroll-body')[0];

const dayInHistory = {}
dayInHistory.host = 'http://history.muffinlabs.com';
dayInHistory.display = document.getElementsByClassName('display')[0];
dayInHistory.slider = document.getElementsByClassName('time-slider')[0];
dayInHistory.progressBar = document.getElementsByClassName('progress-bar')[0];
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
        eventDisplay.classList.add('content-container')
        eventDisplay.innerHTML = this.getImage(event, random).outerHTML + this.getDescription(event).outerHTML;
        eventDisplay.classList.add('hidden')
        this.display.appendChild(eventDisplay);
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
    if (year.includes(' BC')) { yearNumeral = -yearNumeral }
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
        if (this.slider.children[i].classList[0] === era) {
            this.slider.children[i].classList.remove('hidden');
        } else { 
            this.slider.children[i].classList.add('hidden');
        }
    }
}
dayInHistory.init = function() {
    this.getHistory();
}

helperFunctions = {}
helperFunctions.initialized = false; // boolean value to initialize functions only once 
helperFunctions.index = 0; // index of historical events as global variable for access from both scrolling and clicking methods
helperFunctions.animateNav = function() { // toggle padding to create animation
    let on = false;
    setInterval(() => {
        if (!on) {
            document.getElementById('nav-top').style.padding = '5px 0 0 0';
            document.getElementById('nav-bot').style.padding = '0 5px 0 0';
        } else {
            document.getElementById('nav-top').style.padding = '0';
            document.getElementById('nav-bot').style.padding = '0';
        }
        on = !on;
    }, 500);
}
helperFunctions.handleMouseScroll = function(element) {
    const displayContent = dayInHistory.display.childNodes;
    element.addEventListener('wheel', function(e) {
        if (dayInHistory.display.classList.contains('ready')) {
            if (e.deltaY > 0) { // scroll down
                if (displayContent[helperFunctions.index - 1]) { displayContent[helperFunctions.index - 1].classList.add('hidden'); }
                // after scrolling through all contents, start scroll closing process by reversing scroll opening
                if (!displayContent[helperFunctions.index]) { helperFunctions.close(); } 
                helperFunctions.fillProgressBar(displayContent);
                try { displayContent[helperFunctions.index++].classList.remove('hidden'); } catch(err) {  }
            } else { //scroll up
                if (displayContent[helperFunctions.index - 1]) { // prevent scrolling past 0
                    try { displayContent[helperFunctions.index--].classList.add('hidden'); } catch(err) {  }
                    helperFunctions.fillProgressBar(displayContent);
                    displayContent[helperFunctions.index].classList.remove('hidden'); 
                }
            }
        }
    });
}
helperFunctions.fillProgressBar = function(content) {
    let era;
    try { era = content[helperFunctions.index].childNodes[0].childNodes[0].getAttribute('id'); } 
    catch(err) {  }
    dayInHistory.showEra(era);
    dayInHistory.progressBar.style.width = `${ 50 * helperFunctions.index / content.length }vw`;   
}
helperFunctions.handleClick = function(element) { 
    element.addEventListener('click', function(e) {
        helperFunctions.synchProgressBar(e);
        helperFunctions.synchDisplayContent();
    });
}
helperFunctions.synchProgressBar = function(e) {
    const displayContent = dayInHistory.display.childNodes;
    const progressBarLength = 0.5 * window.innerWidth;
    helperFunctions.index = Math.floor(displayContent.length * (e.clientX - dayInHistory.slider.offsetLeft) / progressBarLength);
    dayInHistory.progressBar.style.width = `${ 50 * helperFunctions.index / displayContent.length }vw`;
}
helperFunctions.synchDisplayContent = function() {
    const displayContent = dayInHistory.display.childNodes;
    for (let i = 0; i < displayContent.length; i++) {
        if (i === helperFunctions.index) {
            let era = displayContent[helperFunctions.index].childNodes[0].childNodes[0].getAttribute('id');
            dayInHistory.showEra(era);
            displayContent[i].classList.remove('hidden');
        } else {
            displayContent[i].classList.add('hidden');
        }
    }
}
helperFunctions.handleCloseButton = function() {
    document.getElementsByClassName('close-button')[0].addEventListener('click', function() {
        helperFunctions.close();
    });
}
helperFunctions.open = function() {
    const overlayButton = document.getElementsByClassName('overlay')[0];
    overlayButton.addEventListener('click', function() { // start scroll opening animation on overlay button being clicked
        helperFunctions.index = 0;
        scroll.leftScroll.classList.remove('close');
        scroll.leftScroll.classList.add('left-open');
        scroll.rightScroll.classList.remove('close');
        scroll.rightScroll.classList.add('right-open');
        scroll.scrollBody.classList.remove('hidden');
        dayInHistory.slider.classList.add('revealed');
        dayInHistory.display.classList.add('revealed');
        overlayButton.classList.add('hidden');
        setTimeout(function() {
            document.getElementsByClassName('close-button')[0].classList.remove('hidden');
            document.getElementsByClassName('navigation-top')[0].classList.remove('hidden');
            document.getElementsByClassName('navigation-bottom')[0].classList.remove('hidden');
            dayInHistory.display.childNodes[0].classList.remove('hidden');
            dayInHistory.display.classList.add('ready');
            dayInHistory.progressBar.classList.remove('hidden');
            dayInHistory.progressBar.style.width = 0;
            dayInHistory.showEra(dayInHistory.display.childNodes[0].childNodes[0].childNodes[0].getAttribute('id'));
            if (!helperFunctions.initialized) { // only initialize these functions once
                helperFunctions.initialized = true;
                helperFunctions.handleMouseScroll(dayInHistory.display);
                helperFunctions.handleMouseScroll(dayInHistory.slider);
                helperFunctions.handleMouseScroll(dayInHistory.progressBar);
                helperFunctions.handleClick(dayInHistory.slider);
                helperFunctions.handleClick(dayInHistory.progressBar)
                helperFunctions.animateNav();
                helperFunctions.handleCloseButton();
            }
        }, 1000);
    });     
}
helperFunctions.close = function() {
    scroll.leftScroll.classList.remove('left-open');
    scroll.leftScroll.classList.add('close');
    scroll.rightScroll.classList.remove('right-open');
    scroll.rightScroll.classList.add('close');
    dayInHistory.progressBar.classList.add('hidden');
    dayInHistory.display.classList.remove('ready');
    document.getElementsByClassName('closing')[0].classList.add('revealed');
    document.getElementsByClassName('close-button')[0].classList.add('hidden');
    document.getElementsByClassName('navigation-top')[0].classList.add('hidden');
    document.getElementsByClassName('navigation-bottom')[0].classList.add('hidden');
    setTimeout(function() {
        scroll.scrollBody.classList.add('hidden');
        dayInHistory.slider.classList.remove('revealed');
        dayInHistory.display.classList.remove('revealed'); 
    }, 750);
    setTimeout(function() { 
        document.getElementsByClassName('overlay')[0].classList.remove('hidden');
        for (let i = 0; i < 5; i++) { dayInHistory.slider.children[i].classList.add('hidden') }
        dayInHistory.display.childNodes.forEach(display => { 
            if (!display.classList.contains('hidden')) { display.classList.add('hidden'); }
        });
    }, 1000);
}
helperFunctions.init = function() {
    this.open();
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

