const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const leftScroll = document.getElementsByClassName('left-scroll')[0];
const rightScroll = document.getElementsByClassName('right-scroll')[0];
const scrollBody = document.getElementsByClassName('scroll-body')[0];
const closeButton = document.getElementsByClassName('close-button')[0];
const openButton = document.getElementsByClassName('overlay')[0];
const coinPointer = document.getElementsByClassName('coin')[0];
const arrow = document.getElementsByClassName('arrow')[0];
const yearMarkings = document.getElementsByClassName('marking');
const footer = document.getElementsByTagName('footer')[0];
const closing = document.getElementsByClassName('closing')[0];
const display = document.getElementsByClassName('display')[0];
const displayContent = display.childNodes;
const numOfMarkings = 9;
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
    let index = 0;
    let onTop = true;
    const mid = Math.floor(events.length / 2);
    const step = Math.floor(events.length / numOfMarkings);
    events.forEach(event => {
        const eventDisplay = document.createElement('div');
        eventDisplay.classList.add('content-container');
        random = this.randomImageIndex(random);
        eventDisplay.innerHTML = this.getImage(event, random).outerHTML + this.getDescription(event).outerHTML;
        eventDisplay.classList.add('hidden');
        display.appendChild(eventDisplay);
        if(this.isMarking(mid, step, index)) {
            this.getYearMarkings(event.year, index, events.length, onTop);
            onTop = !onTop;
        }
        index++;
    });
}
dayInHistory.getImage = function(event, random) {
    const imageContainer = document.createElement('div');
    const image = document.createElement('img');
    imageContainer.classList.add('image-container');
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
dayInHistory.isMarking = function(mid, step, index) {
    return Math.abs(index - mid) % step === 0;
}
dayInHistory.getYearMarkings = function(year, index, numOfEvents, onTop) {
    const marking = document.createElement('div'); 
    marking.classList.add('marking');
    if (onTop) {
        marking.innerHTML = `<p style="font-size:20px">${ year }</p><span>&#11167;</span>`;
    } else {
        marking.innerHTML = `<span>&#11165;</span><p style="font-size:20px">${ year }</p>`;
        marking.classList.add('bottom-marking');
    }
    marking.style.left = `${ helperFunctions.calcLeftPos()[0] + helperFunctions.calcLeftPos()[1] * index / (numOfEvents - 1) }px`;
    marking.setAttribute('id', index);
    document.getElementsByTagName('footer')[0].appendChild(marking);
}
dayInHistory.init = function() {
    this.getHistory();
}

helperFunctions = {}
helperFunctions.initialized = false; // boolean value to initialize functions only once 
helperFunctions.screenSize = window.matchMedia(`(max-height: 800px)`);
helperFunctions.calcLeftPos = function() {
    const offset = 0.15 * window.innerHeight;
    let totalLength = window.innerWidth - 0.34 * window.innerHeight;
    if (this.screenSize.matches) {
        totalLength = window.innerWidth - 272;
    }
    return [offset, totalLength];
}
helperFunctions.reposMarkings = function() {
    helperFunctions.moveCoinPointer();
    if (helperFunctions.screenSize.matches) {
        for(let i = 0; i < yearMarkings.length; i++) {
            const index = parseInt(yearMarkings[i].getAttribute('id'));
            yearMarkings[i].style.left = `${ 120 + this.calcLeftPos()[1] * index / (displayContent.length - 1) }px`;
        }
    } else {
        for(let i = 0; i < yearMarkings.length; i++) {
            const index = parseInt(yearMarkings[i].getAttribute('id'));
            yearMarkings[i].style.left = `${ this.calcLeftPos()[0] + this.calcLeftPos()[1] * index / (displayContent.length - 1) }px`;
        }
    }
}
helperFunctions.animateNav = function() { // toggle padding to create animation
    let on = false;
    const buttonDescription = document.getElementById('button-description');
    const yearPointers = document.getElementsByTagName('span');
    setInterval(() => {
        if (!on) {
            buttonDescription.style.padding = '0 5px 0 0';
            for (let i = 0; i < yearMarkings.length; i++) {
                if (coinPointer.style.left === yearMarkings[i].style.left) {
                    yearPointers[i].classList.add('highlight');
                }   
            }
        } else {
            buttonDescription.style.padding = '0';
            for (let i = 0; i < yearPointers.length; i++) {
                if (yearPointers[i].classList.contains('highlight')) {
                    yearPointers[i].classList.remove('highlight');
                }  
            }
        }
        on = !on;
    }, 500);
}
helperFunctions.moveCoinPointer = function() {
    const numOfRotations = 3;
    coinPointer.style.transform = `rotate(${ imageIndex * 360 * numOfRotations / (displayContent.length - 1) }deg)`;
    coinPointer.style.left = `${ this.calcLeftPos()[0] + this.calcLeftPos()[1] * imageIndex / (displayContent.length - 1) }px`;
    if (this.screenSize.matches) {
        coinPointer.style.left = `${ 120 + this.calcLeftPos()[1] * imageIndex / (displayContent.length - 1) }px`;
    }
}
helperFunctions.increaseIndex = function() {
    if (displayContent[imageIndex - 1]) { 
        displayContent[imageIndex - 1].classList.add('hidden'); 
    }
    if (!displayContent[imageIndex]) { 
        helperFunctions.close(); 
    } else {
        try { 
            helperFunctions.moveCoinPointer(); 
            displayContent[imageIndex++].classList.remove('hidden'); 
        } catch(err) {  }
    }  
}
helperFunctions.decreaseIndex = function() {
    if (displayContent[imageIndex - 1]) { // prevent scrolling past 0
        try { 
            displayContent[imageIndex--].classList.add('hidden'); 
        } catch(err) {  }
        helperFunctions.moveCoinPointer();
        displayContent[imageIndex].classList.remove('hidden'); 
    }
}
helperFunctions.handleScreenResize = function() {
    window.addEventListener('resize', function() {
        helperFunctions.reposMarkings();
    });
    if (this.initialized) {
        helperFunctions.reposMarkings();
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
helperFunctions.handleKeyboard = function() {
    document.addEventListener('keydown', function(e) {
        if (display.classList.contains('ready')) {
            if (e.key === 'ArrowRight' || e.key === "ArrowUp") {
                helperFunctions.increaseIndex();
            } else if (e.key === 'ArrowLeft' || e.key === "ArrowDown") {
                helperFunctions.decreaseIndex();
            }
        }
    });
}
helperFunctions.handleClick = function(element) { 
    element.addEventListener('click', function(e) {
        if (display.classList.contains('ready')) {
            let arrowLength = window.innerWidth - 0.3 * window.innerHeight;
            if (helperFunctions.screenSize.matches) {
                arrowLength = window.innerWidth - 0.3 * 800;
            }
            imageIndex = Math.floor(displayContent.length * (e.clientX - element.offsetLeft) / arrowLength);
            helperFunctions.moveCoinPointer();
            for (let i = 0; i < displayContent.length; i++) {
                if (i === imageIndex) {
                    displayContent[i].classList.remove('hidden');
                } else {
                    displayContent[i].classList.add('hidden');
                }
            }
        }
    });
}
helperFunctions.handleYearMarkings = function() {
    if (display.classList.contains('ready')) {
        for(let i = 0; i < yearMarkings.length; i++) {
            yearMarkings[i].addEventListener('click', function() {
                for (let j = 0; j < displayContent.length; j++) {
                    if (j === parseInt(yearMarkings[i].getAttribute('id'))) {
                        displayContent[j].classList.remove('hidden');
                        imageIndex = j;
                        helperFunctions.moveCoinPointer();
                    } else {
                        displayContent[j].classList.add('hidden');
                    }
                }
            });  
        } 
    }
}
helperFunctions.handleCloseButton = function() {
    document.getElementById('close-button').addEventListener('click', function() {
        if (display.classList.contains('ready')) {
            helperFunctions.close();
        }
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (display.classList.contains('ready')) {
                helperFunctions.close();
            }
        }
    });
}
helperFunctions.handleOpenButton = function() {
    document.getElementsByClassName('overlay')[0].addEventListener('click', function() {
        if (!helperFunctions.initialized || (!display.classList.contains('ready') && !display.classList.contains('revealed'))) {
            helperFunctions.open();
        }
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            if (!helperFunctions.initialized || (!display.classList.contains('ready') && !display.classList.contains('revealed'))) { 
                helperFunctions.open();
            }
        }
    });
}
helperFunctions.open = function() {
    imageIndex = 0;
    this.moveCoinPointer();
    leftScroll.classList.add('left-open');
    rightScroll.classList.add('right-open');
    leftScroll.classList.replace('close','left-open');
    rightScroll.classList.replace('close', 'right-open');
    scrollBody.classList.remove('hidden');
    display.classList.add('revealed');
    openButton.classList.add('hidden');
    closing.classList.add('hidden');
    for(let i = 0; i < yearMarkings.length; i++) {
        yearMarkings[i].classList.remove('hidden');
    }
    setTimeout(function() {
        closeButton.classList.remove('hidden');
        displayContent[0].classList.remove('hidden');
        display.classList.add('ready');
        for(let i = 0; i < yearMarkings.length; i++) {
            yearMarkings[i].classList.add('fade-in');
        }
        if (!helperFunctions.initialized) { // only initialize these functions once
            helperFunctions.initialized = true;
            helperFunctions.handleMouseScroll(footer);
            helperFunctions.handleClick(arrow.children[1]);
            helperFunctions.handleYearMarkings();
            helperFunctions.handleKeyboard();
            helperFunctions.handleCloseButton();
            helperFunctions.handleScreenResize();
            helperFunctions.animateNav();
        }
    }, 1000);    
}
helperFunctions.close = function() {
    imageIndex = 0;
    this.moveCoinPointer();
    leftScroll.classList.replace('left-open', 'close');
    rightScroll.classList.replace('right-open', 'close');
    display.classList.remove('ready');
    closing.classList.remove('hidden');
    closing.classList.add('fade-in');
    for(let i = 0; i < yearMarkings.length; i++) {
        yearMarkings[i].classList.replace('fade-in', 'hidden');
    }
    setTimeout(function() { 
        closeButton.classList.add('hidden');
        scrollBody.classList.add('hidden');
        display.classList.remove('revealed');
        openButton.classList.remove('hidden');
        displayContent.forEach(event => { 
            if (!event.classList.contains('hidden')) { event.classList.add('hidden'); }
        });
    }, 1000);
}
helperFunctions.init = function() {
    this.handleOpenButton();
}

// mobileFunctions = {}
// mobileFunctions.mediaQuery = function(screenSize) {
//     return window.matchMedia(`(max-width: ${ screenSize }px)`);
// }
// mobileFunctions.interpolate = function(x1, x2, y1, y2, x) {
//     return y1 + ((y2 - y1) * (x - x1) / (x2 - x1));
// }
// mobileFunctions.handleScreenSize = function(mediaQuery) {
//     if (mediaQuery.matches) {
//         window.onresize = function() {
//             if (screen.width > 1024) {
//                 scrollBody.style.transform = `rotate(90deg) translateY(${ mobileFunctions.interpolate(1200, 250, 0, 20, window.innerWidth) }vw)`;    
//             } else {
//                 scrollBody.style.transform = `rotate(90deg) translateY(${ mobileFunctions.interpolate(1200, 250, 25, 20, screen.width) }vw)`;
//             }
//         }
//     } else {
//         window.onresize = function() {
//             scrollBody.style.transform = '';
//         }
//     }
// }
// mobileFunctions.init = function() {
//     this.handleScreenSize(this.mediaQuery(1200));
//     this.mediaQuery(1200).addListener(this.handleScreenSize);
// }


if (document.readyState === "complete") {
    dayInHistory.init();
    helperFunctions.init();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        dayInHistory.init();
        helperFunctions.init();
    });
}

