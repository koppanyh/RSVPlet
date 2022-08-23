javascript: (function() {
	const settings = {wpm: 400, startDelay: 2000, punctMult: 2.5, punctAdd: 0, symbMult: 1.5, symbAdd: 0, fontSize: "50px", color: "white", color2: "#FF4444", backgroundColor: "rgba(0, 0, 0, 0.9)", punctuation: ".,!?;:", symbols: "0123456789`~@#$%^&*()-_=+[{]}\\|'\"<>/"};
	function includeAny(word, chars) {
		for (let i = 0; i < chars.length; i++)
			if (word.includes(chars[i]))
				return true;
		return false;
	}
	const charDelay = 60000 / (settings.wpm * 5);
	function calcDelay(word) {
		let delay = Math.max(word.length, 5) * charDelay;
		if (includeAny(word, settings.punctuation))
			delay = (delay * settings.punctMult) + settings.punctAdd;
		else if (includeAny(word, settings.symbols))
			delay = (delay * settings.symbMult) + settings.symbAdd;
		return delay;
	}
	let RSVP = class {
		constructor(text) {
			let splitted = text.trim().replace(/\n/g, '  ').split(' ');
			this.words = splitted.map(x => {
				return {text: x, delay: calcDelay(x)};
			});
			this.index = 0;
			/* this.totalTime = words.map(x => x.delay)
				.reduce((a, b) => a + b, 0); */
			this.timeout = null;
		}
		next() {
			if (this.index >= this.words.length)
				return null;
			return this.words[this.index++];
		}
		run() {
			let next = this.next();
			if (!next)
				return;
			this.timeout = setTimeout(() => { this.run(); },
				next.delay);
			console.log(next.text);
		}
		start() {
			let next = this.next();
			this.timeout = setTimeout(() => { this.run(); },
				settings.startDelay);
			console.log(next.text);
		}
		stop() {
			clearInterval(this.timeout);
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