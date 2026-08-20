(() => {
	const links = document.querySelectorAll('.service-nav a');
	const sections = [...links].map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
	const setActive = id => links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + id));
	if ('IntersectionObserver' in window) {
		const observer = new IntersectionObserver(entries => entries.forEach(entry => {
			if (entry.isIntersecting) setActive(entry.target.id);
		}), { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
		sections.forEach(section => observer.observe(section));
	}
	links.forEach(link => link.addEventListener('click', () => setActive(link.getAttribute('href').slice(1))));
})();
