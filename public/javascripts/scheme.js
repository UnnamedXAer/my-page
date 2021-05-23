(() => {
	const updatePicksURLsFunc =
		typeof updatePicksURLs === 'function' ? updatePicksURLs : () => {};
	function prefSchemaMatchChangeHandler(ev) {
		document.body.dataset.scheme = psm.matches ? 'light' : 'dark';
		updatePicksURLsFunc();
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
		const currScheme = document.body.dataset.scheme;
		let newScheme = 'dark';
		if (currScheme === 'dark') {
			newScheme = 'light';
		}
		document.body.dataset.scheme = newScheme;
		localStorage.setItem('scheme', newScheme);
		updatePicksURLsFunc();
	});

	updatePicksURLsFunc();
})();
