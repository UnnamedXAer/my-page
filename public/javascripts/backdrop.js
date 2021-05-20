function showBackdrop(contentEl) {
	const backdrop = document.querySelector('.backdrop');

	if (backdrop.firstElementChild.hasChildNodes()) {
		backdrop.firstElementChild.firstElementChild.remove();
	}

	backdrop.setAttribute('tabIndex', '0');
	backdrop.classList.add('active');
	backdrop.previousElementSibling.classList.add('active');
	backdrop.children[0].appendChild(contentEl);
	backdrop.addEventListener('click', clickHandler);
	backdrop.addEventListener('keyup', keyupHandler);

	function keyupHandler(ev) {
		if (ev.keyCode === 27) {
			hideBackdrop();
		}
	}

	function clickHandler(ev) {
		hideBackdrop();
	}

	function hideBackdrop() {
		backdrop.removeEventListener('click', clickHandler);
		backdrop.removeEventListener('keyup', keyupHandler);
		backdrop.previousElementSibling.classList.remove('active');
		backdrop.classList.remove('active');
		backdrop.setAttribute('tabIndex', '-1');
	}

	backdrop.focus();
}
