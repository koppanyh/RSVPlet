javascript: (function() {
    const settings = {wpm: 400, startDelay: 2000, punctMult: 2.5, punctAdd: 0, symbMult: 1.5, symbAdd: 0, fontSize: "50px", color: "white", color2: "#FF4444", backgroundColor: "rgba(0, 0, 0, 0.9)", punctuation: ".,!?;:", symbols: "0123456789`~@#$%^&*()-_=+[{]}\\|'\"<>/"};
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
            this.timeout = setTimeout(() => { this.#run(); },
                next.delay);
            console.log(next.text);
        }
        #setup() {
            let rsvpDiv = document.createElement("div");
            rsvpDiv.style = `position: fixed; top: 40%; left: 10%; width: 80%;
                padding: 0.5em; border-radius: 10px; text-align: center;
                font-weight: bold; font-size: ${settings.fontSize};
                font-family: monospace; color: ${settings.color};
                background-color: ${settings.backgroundColor};
                z-index: 999999999;`;
            document.body.appendChild(rsvpDiv);
            this.rsvpDiv = rsvpDiv;
        }
        #teardown() {
            this.rsvpDiv.remove();
        }
        start() {
            this.#setup();
            let next = this.#next();
            this.timeout = setTimeout(() => { this.#run(); },
                settings.startDelay);
            console.log(next.text);
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
