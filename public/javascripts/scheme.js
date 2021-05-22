(() => {
	function updateSkillsPicksURLs() {
		const figureEl = document.querySelector('.skills figure');
		const elems = figureEl.querySelectorAll('picture *');
		const imgScheme = document.body.dataset.scheme === 'light' ? '-light' : '';
		console.log('updating picks', imgScheme);
		const imgScrs = [
			`/images/programming-por${imgScheme}.png`,
			`/images/programming-land${imgScheme}.png`,
			`/images/programming${imgScheme}.png`
		];

		elems.forEach((el, i) => {
			el.srcset = imgScrs[i];
		});

		figureEl.classList.remove('lazy_loading');
	}
	function prefSchemaMatchChangeHandler(ev) {
		console.log('pref scheme media changed');
		document.body.dataset.scheme = psm.matches ? 'light' : 'dark';
		updateSkillsPicksURLs();
	}

	let prefSchemaMatch = null;
	const savedScheme = localStorage.getItem('scheme');
	if (savedScheme) {
		document.body.dataset.scheme = savedScheme;
	} else {
		prefSchemaMatch = window.matchMedia('(prefers-color-scheme: light)');
		prefSchemaMatch.addEventListener('change', prefSchemaMatchChangeHandler);

		if (prefSchemaMatch.matches) {
			document.body.dataset.scheme = 'light';
		}
	}

	const schemeSwitch = document.querySelector('.header__scheme_switch');
	// I may use cookies to set it on render
	schemeSwitch.addEventListener('click', function (ev) {
		if (prefSchemaMatch) {
			prefSchemaMatch.removeEventListener('change', prefSchemaMatchChangeHandler);
		}
		console.log('listener removed');
		const currScheme = document.body.dataset.scheme;
		let newScheme = 'dark';
		if (currScheme === 'dark') {
			newScheme = 'light';
		}
		document.body.dataset.scheme = newScheme;
		localStorage.setItem('scheme', newScheme);
		updateSkillsPicksURLs();
	});

	updateSkillsPicksURLs();
})();
