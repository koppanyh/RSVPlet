javascript: (function() {
    const settings = {wpm: 400, startDelay: 2000, punctMult: 2.5, punctAdd: 0, symbMult: 1.5, symbAdd: 0, fontSize: "50px", color: "white", color2: "#FF4444", backgroundColor: "rgba(0, 0, 0, 0.9)", modalColor: "rgba(0, 0, 0, 0.5)", punctuation: ".,!?;:", symbols: "0123456789`~@#$%^&*()-_=+[{]}\\|'\"<>/"};
    function includeAny(word, chars) {
        for (let i = 0; i < chars.length; i++)
            if (word.includes(chars[i]))
                return true;
        return false;
    }
    let RSVP = class {
        constructor(text) {
            this.totalTime = 0;
            let splitted = text.trim().replace(/\n/g, '  ').split(' ');
            this.words = splitted.map(x => { return {text: x}; });
            this.#calcDelay();
            this.index = 0;
            this.timeout = null;
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
                this.stop();
                return;
            }
            this.timeout = setTimeout(() => { this.#run(); }, next.delay);
            this.#print(next.text);
        }
        #setup() {
            let modalDiv = document.createElement("div");
            modalDiv.style = `position: fixed; top: 0; left: 0; width: 100%;
                height: 100%; z-index: 999999998;
                background-color: ${settings.modalColor};`;
            modalDiv.onclick = () => { this.stop(); };
            document.body.appendChild(modalDiv);
            this.modalDiv = modalDiv;
            let rsvpDiv = document.createElement("div");
            rsvpDiv.style = `position: fixed; top: 40%; left: 10%; width: 80%;
                padding: 0.5em; border-radius: 10px; text-align: center;
                font-weight: bold; font-size: ${settings.fontSize};
                font-family: monospace; color: ${settings.color};
                background-color: ${settings.backgroundColor};
                z-index: 999999999;`;
            rsvpDiv.onclick = () => { this.playPause(); };
            document.body.appendChild(rsvpDiv);
            this.rsvpDiv = rsvpDiv;
        }
        #teardown() {
            this.rsvpDiv.remove();
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
            this.rsvpDiv.innerHTML = `${first}<span style="color: ${settings.color2}">${second}</span>${third}`;
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
/* TODO get selection working within PDFs and box of https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align */
/* TODO if the word is the same as the last one, blink it */
/* TODO add estimated reading time */
/* TODO add progress bar */
