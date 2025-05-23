javascript: (function() {
    const settings = {
        wpm: 500,
        startDelay: 1000,
        endDelay: 500,
        punctMult: 2.5,
        punctAdd: 0,
        symbMult: 1.5,
        symbAdd: 0,
        enableStatus: true,
        enableTime: true,
        enableProgress: true,
        textFontSize: "50px",
        statusFontSize: "10px",
        progressSize: "10px",
        textColor: "white",
        textColor2: "#FF4444",
        statusColor: "grey",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        modalColor: "rgba(0, 0, 0, 0.5)",
        progressColor: "rgba(255, 255, 0, 0.15)",
        punctuation: ".,!?;:",
        symbols: "0123456789`~@#$%^&*()-_=+[{]}\\|'\"<>/",
        enableClipboard: true
    };
    function includeAny(word, chars) {
        for (let i = 0; i < chars.length; i++)
            if (word.includes(chars[i]))
                return true;
        return false;
    }
    let RSVP = class {
        constructor(text) {
            let list = text.trim().replace(/\t /g, ' ').replace(/\t\n/g, ' ').replace(/\t/g, ' ')
                .replace(/\n/g, '  ').replace(/\u00a0/g, ' ').split(' ').reverse();
            let splitted = [];
            while (list.length > 0) {
                if (list[list.length - 1] == splitted[splitted.length - 1])
                    splitted.push('');
                splitted.push(list.pop());
            }
            this.words = splitted.map(x => { return {text: x}; });
            this.index = 0;
            this.timeout = null;
            this.totalTime = 0;
            this.spentTime = 0;
            this.modalDiv = null;
            this.rsvpDiv = null;
            this.progDiv = null;
            this.statusDisp = null;
            this.#calcDelay();
            this.escapeHTMLPolicy = typeof trustedTypes !== "undefined"
                ? trustedTypes.createPolicy("forceInner", { createHTML: (to_escape) => to_escape })
                : { createHTML: (to_escape) => to_escape };
            this.handleKeypressHandler = null;
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
            rsvpDiv.style = `position: fixed; top: 40%; text-align: center;
                padding: 0.5em 0 0.5em 0; border-radius: 0 0 10px 10px;
                font-weight: bold; font-size: ${settings.textFontSize};
                font-family: monospace; color: ${settings.textColor}; left: 10%;
                background-color: ${settings.backgroundColor}; width: 80%;`;
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
            if (settings.enableStatus) {
                let statusDisp = document.createElement("span");
                statusDisp.style = `position: fixed; top: 40%; left: 10%;
                    padding-left: 10px; font-size: ${settings.statusFontSize};
                    font-family: monospace; color: ${settings.statusColor};`;
                modalDiv.appendChild(statusDisp);
                this.statusDisp = statusDisp;
            }
            if (settings.enableTime) {
                let timeDisp = document.createElement("span");
                timeDisp.style = `position: fixed; top: 40%; left: 10%;
                    width: 80%; text-align: center;
                    font-size: ${settings.statusFontSize};
                    font-family: monospace; color: ${settings.statusColor};`;
                timeDisp.innerHTML = this.escapeHTMLPolicy.createHTML( this.totalTime < 60000 ?
                    `${Math.floor(this.totalTime / 100) / 10 + 1} seconds` :
                    `${Math.floor(this.totalTime / 6000) / 10 + 1} minutes` );
                modalDiv.appendChild(timeDisp);
            }
            document.body.appendChild(modalDiv);
            this.handleKeypressHandler = this.#handleKeypress.bind(this);
            document.body.addEventListener("keydown", this.handleKeypressHandler, true);
        }
        #teardown() {
            document.body.removeEventListener("keydown", this.handleKeypressHandler, true);
            this.modalDiv.remove();
        }
        #print(word) {
            if (word.trim() === '') {
                this.rsvpDiv.innerHTML = this.escapeHTMLPolicy.createHTML( "&nbsp;" );
                return;
            }
            let middle = Math.floor((word.length % 2 === 0 ? word.length - 1 : word.length) / 2);
            let first = word.substr(0, middle);
            let second = word.substr(middle, 1);
            let third = word.substr(middle + 1);
            this.rsvpDiv.innerHTML = this.escapeHTMLPolicy.createHTML(
                `${first}<span style="color: ${settings.textColor2}">${second}</span>${third}` );
        }
        #updateStatus(msg) {
            if (settings.enableStatus)
                this.statusDisp.innerHTML = this.escapeHTMLPolicy.createHTML( msg );
        }
        #handleKeypress(evt) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            if (evt.code === "Space" || evt.keyCode === 32) this.playPause();
            else if (evt.code == "Escape" || evt.keyCode === 27) this.stop();
        }
        playPause() {
            if (this.timeout !== null) {
                this.#updateStatus("Paused");
                this.rsvpDiv.style.transition = "opacity 200ms linear";
                this.rsvpDiv.style.opacity = 0.5;
                clearInterval(this.timeout);
                this.timeout = null;
            } else {
                this.#updateStatus("Resuming");
                this.rsvpDiv.style.transition =
                    `opacity ${settings.startDelay}ms linear`;
                this.rsvpDiv.style.opacity = 1;
                this.timeout = setTimeout(() => {
                    this.#updateStatus("");
                    this.#run();
                }, settings.startDelay);
            }
        }
        start() {
            this.#setup();
            let next = this.#next();
            this.timeout = setTimeout(() => {
                this.#updateStatus("");
                this.#run();
            }, settings.startDelay);
            this.#updateProgress(next.delay);
            this.#updateStatus("Starting");
            this.#print(next.text);
        }
        stop() {
            clearInterval(this.timeout);
            this.#teardown();
        }
    };
    function noTextErr() {
        new RSVP("NO_SELECTION_FOUND_ERR").start();
    }
    function readFromClipboard() {
        if (settings.enableClipboard) {
            navigator.clipboard.readText()
                .then(t => {
                    if (t) new RSVP(t).start();
                    else noTextErr();
                }).catch(e => {
                    console.error(e);
                    if (e instanceof DOMException) {
                        new RSVP("CLIPBOARD_NOT_ENABLED_ERR").start();
                    } else {
                        new RSVP(e).start();
                    }
                });
        } else noTextErr();
    }
    function readFromPdf() {
        let embed = document.querySelector("embed");
        if (embed && embed.type && embed.type.includes("pdf")) {
            let handler = e => {
                if (e.data && e.data.type == "getSelectedTextReply") {
                    window.removeEventListener("message", handler);
                    if (e.data.selectedText) {
                        new RSVP(e.data.selectedText).start();
                    } else readFromClipboard();
                }
            };
            window.addEventListener("message", handler);
            embed.postMessage({type: "getSelectedText"}, '*');
        } else readFromClipboard();
    }
    let selection = (
        window.getSelection ? window.getSelection() :
        document.getSelection ? document.getSelection() :
        document.selection.createRange().text
    ) + '';
    if (selection) new RSVP(selection).start();
    else readFromPdf();
})();
/*
 * TODO get selection working within Google Docs
 */
/*
 * RSVPlet by @koppanyh, 2024.
 * Contributors: Frost Sheridan
 * https://github.com/koppanyh/RSVPlet
 * Version 12
*/