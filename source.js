javascript: (function() {
    const settings = {
        wpm: 400,
        startDelay: 2000,
        endDelay: 1000,
        punctMult: 2.5,
        punctAdd: 0,
        symbMult: 1.5,
        symbAdd: 0,
        enableTime: true,
        enableProgress: false,
        textFontSize: "50px",
        timeFontSize: "10px",
        progressSize: "10px",
        textColor: "white",
        textColor2: "#FF4444",
        timeColor: "grey",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        modalColor: "rgba(0, 0, 0, 0.5)",
        progressColor: "rgba(255, 255, 0, 0.15)",
        punctuation: ".,!?;:",
        symbols: "0123456789`~@#$%^&*()-_=+[{]}\\|'\"<>/"
    };
    function includeAny(word, chars) {
        for (let i = 0; i < chars.length; i++)
            if (word.includes(chars[i]))
                return true;
        return false;
    }
    let RSVP = class {
        constructor(text) {
            let splitted = text.trim().replace(/\n/g, '  ').split(' ');
            this.words = splitted.map(x => { return {text: x}; });
            this.#calcDelay();
            this.index = 0;
            this.timeout = null;
            this.spentTime = 0;
        }
        #calcDelay() {
            this.totalTime = 0;
            const charDelay = 60000 / (settings.wpm * 5);
            this.words.forEach(item => {
                let delay = Math.max(item.text.length, 5) * charDelay;
                if (includeAny(item.text, settings.punctuation))
                    delay = (delay * settings.punctMult) + settings.punctAdd;
                else if (includeAny(item.text, settings.symbols))
                    delay = (delay * settings.symbMult) + settings.symbAdd;
                item.delay = delay;
                this.totalTime += delay;
            });
        }
        #next() {
            if (this.index >= this.words.length)
                return null;
            return this.words[this.index++];
        }
        #run() {
            let next = this.#next();
            if (!next) {
                this.timeout = setTimeout(() => { this.stop(); },
                    settings.endDelay);
                return;
            }
            this.timeout = setTimeout(() => { this.#run(); }, next.delay);
            this.#updateProgress(next.delay);
            this.#print(next.text);
        }
        #updateProgress(delay) {
            this.spentTime += delay;
            if (!settings.enableProgress)
                return;
            let progress = 100 * this.spentTime / this.totalTime;
            this.progDiv.style.width = `${Math.min(progress * 0.8, 80)}%`;
        }
        #setup() {
            let modalDiv = document.createElement("div");
            modalDiv.style = `position: fixed; top: 0; left: 0; width: 100%;
                height: 100%; z-index: 999999999;
                background-color: ${settings.modalColor};`;
            modalDiv.onclick = () => { this.stop(); };
            this.modalDiv = modalDiv;
            let rsvpDiv = document.createElement("div");
            rsvpDiv.style = `position: fixed; top: 40%; left: 10%; width: 80%;
                padding: 0.5em; border-radius: 0 0 10px 10px; text-align: center;
                font-weight: bold; font-size: ${settings.textFontSize};
                font-family: monospace; color: ${settings.textColor};
                background-color: ${settings.backgroundColor};`;
            rsvpDiv.onclick = (evt) => {
                evt.stopPropagation();
                this.playPause();
            };
            modalDiv.appendChild(rsvpDiv);
            this.rsvpDiv = rsvpDiv;
            if (settings.enableProgress) {
                let progDiv = document.createElement("div");
                progDiv.style = `position: fixed; top: 40%; left: 10%;
                    width: 0%; height: ${settings.progressSize};
                    background-color: ${settings.progressColor};`;
                modalDiv.appendChild(progDiv);
                this.progDiv = progDiv;
            }
            if (settings.enableTime) {
                let timeDisp = document.createElement("span");
                timeDisp.style = `position: fixed; top: 40%; left: 10%;
                    width: 80%; text-align: center;
                    font-size: ${settings.timeFontSize};
                    font-family: monospace; color: ${settings.timeColor}`;
                timeDisp.innerHTML = this.totalTime < 60000 ?
                    `${Math.floor(this.totalTime / 100) / 10 + 1} seconds` :
                    `${Math.floor(this.totalTime / 6000) / 10 + 1} minutes`;
                modalDiv.appendChild(timeDisp);
            }
            document.body.appendChild(modalDiv);
        }
        #teardown() {
            this.modalDiv.remove();
        }
        #print(word) {
            if (word.trim() === '') {
                this.rsvpDiv.innerHTML = "&nbsp;";
                return;
            }
            let middle = Math.floor(word.length / 2);
            let first = word.substr(0, middle);
            let second = word.substr(middle, 1);
            let third = word.substr(middle + 1);
            this.rsvpDiv.innerHTML = `${first}<span style="color: ${settings.textColor2}">${second}</span>${third}`;
        }
        playPause() {
            if (this.timeout !== null) {
                clearInterval(this.timeout);
                this.timeout = null;
            } else {
                this.timeout = setTimeout(() => { this.#run(); },
                    settings.startDelay);
            }
        }
        start() {
            this.#setup();
            let next = this.#next();
            this.timeout = setTimeout(() => { this.#run(); },
                settings.startDelay);
            this.#updateProgress(next.delay);
            this.#print(next.text);
        }
        stop() {
            clearInterval(this.timeout);
            this.#teardown();
        }
    };
    let selection = (
        window.getSelection ? window.getSelection() :
        document.getSelection ? document.getSelection() :
        document.selection.createRange().text
    ) + '';
    let rsvp = new RSVP(selection);
    rsvp.start();
})();
/*
TODO get selection working within PDFs and Google Docs and code boxes of https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align
TODO if the word is the same as the last one, blink it
*/
/*
RSVPlet by @koppanyh, 2022.
https://github.com/koppanyh/RSVPlet
Version 4
*/
