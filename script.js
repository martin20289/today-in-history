const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

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
        // image
        const imageContainer = document.createElement('div');
        const image = document.createElement('img');
        imageContainer.classList.add('image-container');
        random = this.randomImageIndex(random);
        const era = this.getEra(event.year, event.text, random);
        image.src = era[0];
        image.setAttribute('id', era[1]);
        imageContainer.appendChild(image);
        
        // text description of historical events
        const textContainer = document.createElement('div');
        const yearText = document.createElement('h2');
        const description = document.createElement('p');
        yearText.classList.add('content');
        description.classList.add('content');
        yearText.innerHTML = `Year ${ event.year }`;
        description.innerHTML = event.text;
        textContainer.classList.add('text-container');
        textContainer.innerHTML = yearText.outerHTML + description.outerHTML;

        // content container
        const eventDisplay = document.createElement('div');
        eventDisplay.classList.add('content-container')
        eventDisplay.innerHTML = imageContainer.outerHTML + textContainer.outerHTML;
        eventDisplay.classList.add('hidden')

        this.display.appendChild(eventDisplay);
    })
}

dayInHistory.randomImageIndex = function(prevNum) {
    let random = Math.floor(Math.random()*5 + 1);
    while (random === prevNum) {
        random = Math.floor(Math.random()*5 + 1);
    }
    return random;
}

dayInHistory.getYearNumeral = function(year) { // convert 'BC' to negative
    let yearNumeral = parseInt(year);
    if (year.includes(' BC')) { yearNumeral = -yearNumeral }
    return yearNumeral;
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

dayInHistory.isWWI = function(text) {
    return text.toLowerCase().includes('world war 1') || text.toLowerCase().includes('ww1') || text.toLowerCase().includes('world war i') || text.toLowerCase().includes('wwi');
}

dayInHistory.isWWII = function(text) {
    return text.toLowerCase().includes('world war 2') || text.toLowerCase().includes('ww2') || text.toLowerCase().includes('world war ii') || text.toLowerCase().includes('wwii');
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
helperFunctions.handleMouseScroll = function() {
    const displayContent = dayInHistory.display.childNodes;
    dayInHistory.display.addEventListener('wheel', function(e) {
        if (e.deltaY > 0) { // scroll down
            // prevent scrolling past 0
            if (displayContent[helperFunctions.index - 1]) { displayContent[helperFunctions.index - 1].classList.add('hidden'); }
            // after scrolling through all contents, start scroll closing process by reversing scroll opening
            if (!displayContent[helperFunctions.index]) {
                helperFunctions.close();
            }
            if (dayInHistory.display.classList.contains('revealed')) {
                let era = displayContent[helperFunctions.index].childNodes[0].childNodes[0].getAttribute('id');
                dayInHistory.showEra(era);
                displayContent[helperFunctions.index++].classList.remove('hidden');
                dayInHistory.progressBar.style.width = `${ 50 * helperFunctions.index / displayContent.length }vw`;
            }
            
        } else { //scroll up
            if (displayContent[helperFunctions.index - 1]) { 
                displayContent[helperFunctions.index--].classList.add('hidden');
                let era = displayContent[helperFunctions.index].childNodes[0].childNodes[0].getAttribute('id');
                dayInHistory.showEra(era);
                dayInHistory.progressBar.style.width = `${ 50 * helperFunctions.index / displayContent.length }vw`;
                displayContent[helperFunctions.index].classList.remove('hidden'); 
            }
        }
    });
}

helperFunctions.handleClick = function() {
    const displayContent = dayInHistory.display.childNodes;

    dayInHistory.slider.addEventListener('click', function(e) {
        const progressBarLength = 0.5 * window.innerWidth;
        helperFunctions.index = Math.floor(displayContent.length * (e.clientX - dayInHistory.slider.offsetLeft) / progressBarLength);
        dayInHistory.progressBar.style.width = `${ 50 * helperFunctions.index / displayContent.length }vw`;
        for (let i = 0; i < displayContent.length; i++) {
            if (i === helperFunctions.index) {
                let era = displayContent[helperFunctions.index].childNodes[0].childNodes[0].getAttribute('id');
                dayInHistory.showEra(era);
                displayContent[i].classList.remove('hidden');
            } else {
                displayContent[i].classList.add('hidden');
            }
        }
    });

    dayInHistory.progressBar.addEventListener('click', function(e) {
        const progressBarLength = 0.5 * window.innerWidth;
        helperFunctions.index = Math.floor(displayContent.length * (e.clientX - dayInHistory.slider.offsetLeft) / progressBarLength);
        dayInHistory.progressBar.style.width = `${ 50 * helperFunctions.index / displayContent.length }vw`;
        for (let i = 0; i < displayContent.length; i++) {
            if (i === helperFunctions.index) {
                let era = displayContent[helperFunctions.index].childNodes[0].childNodes[0].getAttribute('id');
                dayInHistory.showEra(era);
                displayContent[i].classList.remove('hidden');
            } else {
                displayContent[i].classList.add('hidden');
            }
        }
    });

    if (this.index === dayInHistory.display.childNodes.length) { return; }
}

helperFunctions.open = function() {
    const overlayButton = document.getElementsByClassName('overlay')[0];
    overlayButton.addEventListener('click', function() {
        helperFunctions.index = 0;
        // start scroll opening animation on overlay button being clicked
        document.getElementsByClassName('left-scroll')[0].classList.remove('close');
        document.getElementsByClassName('right-scroll')[0].classList.remove('close');
        document.getElementsByClassName('left-scroll')[0].classList.add('left-open');
        document.getElementsByClassName('right-scroll')[0].classList.add('right-open');
        document.getElementsByClassName('time-slider')[0].classList.add('revealed');
        dayInHistory.display.childNodes.forEach(display => {
            display.classList.add('hidden');
        });
        dayInHistory.display.classList.add('revealed');
        overlayButton.classList.add('hidden');
        setTimeout(function() {
            document.getElementsByClassName('navigation-top')[0].classList.remove('hidden');
            document.getElementsByClassName('navigation-bottom')[0].classList.remove('hidden');
            dayInHistory.display.childNodes[0].classList.remove('hidden');
            dayInHistory.progressBar.classList.remove('hidden');
            dayInHistory.progressBar.style.width = 0;
            dayInHistory.showEra(dayInHistory.display.childNodes[0].childNodes[0].childNodes[0].getAttribute('id'));
            
            if (!helperFunctions.initialized) {
                // only initialize these functions once
                helperFunctions.initialized = true;
                helperFunctions.handleMouseScroll(helperFunctions.index);
                helperFunctions.handleClick();
            }
        }, 1000);
    });     
}
helperFunctions.close = function() {
    document.getElementsByClassName('left-scroll')[0].classList.remove('left-open');
    document.getElementsByClassName('left-scroll')[0].classList.add('close');
    document.getElementsByClassName('right-scroll')[0].classList.remove('right-open');
    document.getElementsByClassName('right-scroll')[0].classList.add('close');
    document.getElementsByClassName('closing')[0].classList.add('revealed');
    document.getElementsByClassName('navigation-top')[0].classList.add('hidden');
    document.getElementsByClassName('navigation-bottom')[0].classList.add('hidden');
    dayInHistory.progressBar.classList.add('hidden');
    setTimeout(function() {
        document.getElementsByClassName('time-slider')[0].classList.remove('revealed');
        dayInHistory.display.classList.remove('revealed');
        document.getElementsByClassName('overlay')[0].classList.remove('hidden');
    }, 1000);
}
helperFunctions.init = function() {
    this.open();
    this.animateNav();
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

