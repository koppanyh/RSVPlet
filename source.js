javascript: var settings = {wpm: 400, startDelay: 2000, punctMult: 2.5, punctAdd: 0, symbMult: 1.5, symbAdd: 0, fontSize: "50px", color: "white", color2: "#FF4444", backgroundColor: "rgba(0, 0, 0, 0.9)", punctuation: ".,!?;", symbols: "0123456789`~@#$%^&*()-_=+[{]}\\|:'\"<>/"};
/* TODO get selection working within PDFs and box of https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align */
var sel = window.getSelection? window.getSelection() : document.getSelection? document.getSelection() : document.selection.createRange().text;
var words = (sel + '').replace(/\n/g, '  ').split(' ').reverse();
function includeAny(word, chars) {
    for (var i = 0; i < chars.length; i++)
        if (word.includes(chars[i]))
            return true;
    return false;
}
var charDelay = 60000 / (settings.wpm * 5);
function calcDelay(word) {
    var delay = Math.max(word.length, 5) * charDelay;
    if (includeAny(word, settings.punctuation))
        delay = (delay * settings.punctMult) + settings.punctAdd;
    else if (includeAny(word, settings.symbols))
        delay = (delay * settings.symbMult) + settings.symbAdd;
    return delay;
}
var rsvpDiv;
/* TODO get it to pause somehow and go away if you need to */
function setupDiv() {
    rsvpDiv = document.createElement("div");
    rsvpDiv.style.position = "fixed";
    rsvpDiv.style.top = "40%";
    rsvpDiv.style.left = "10%";
    rsvpDiv.style.width = "80%";
    rsvpDiv.style.padding = "0.5em";
    rsvpDiv.style.borderRadius = "10px";
    rsvpDiv.style.textAlign = "center";
    rsvpDiv.style.fontWeight = "bold";
    rsvpDiv.style.fontSize = settings.fontSize;
    rsvpDiv.style.fontFamily = "monospace";
    rsvpDiv.style.color = settings.color;
    rsvpDiv.style.backgroundColor = settings.backgroundColor;
    rsvpDiv.style.zIndex = 999999999;
    document.body.appendChild(rsvpDiv);
}
function printWord(word) {
    if (word == ' ' || word == '') {
        rsvpDiv.innerHTML = "&nbsp";
        return;
    }
    var middle = Math.floor(word.length / 2);
    var first = word.substr(0, middle);
    var second = word.substr(middle, 1);
    var third = word.substr(middle + 1);
    rsvpDiv.innerHTML = `${first}<span style="color: ${settings.color2}">${second}</span>${third}`;
}
/* TODO if the word is the same as the last one, blink it */
function rsvp() {
    if (!words.length) {
        rsvpDiv.remove();
        return;
    }
    var word = words.pop();
    printWord(word);
    setTimeout(rsvp, calcDelay(word));
}
setupDiv();
printWord(words.pop());
setTimeout(rsvp, settings.startDelay);
/* TODO add estimated reading time */
/* TODO add progress bar */