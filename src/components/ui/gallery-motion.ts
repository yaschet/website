let nextFilterId = 0;

/** Horizontal exposure follows measured screen velocity and is absent at rest. */
export function createGalleryMotionBlur(root: HTMLElement) {
	const ns = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(ns, "svg");
	svg.setAttribute("width", "0");
	svg.setAttribute("height", "0");
	svg.setAttribute("aria-hidden", "true");
	svg.style.position = "absolute";
	const filter = document.createElementNS(ns, "filter");
	filter.id = `gallery-exposure-${++nextFilterId}`;
	filter.setAttribute("x", "-10%");
	filter.setAttribute("width", "120%");
	filter.setAttribute("y", "-1%");
	filter.setAttribute("height", "102%");
	const blur = document.createElementNS(ns, "feGaussianBlur");
	blur.setAttribute("stdDeviation", "0 0");
	filter.append(blur);
	svg.append(filter);
	root.append(svg);
	let targets: HTMLElement[] = [];
	const update = (velocity: number, elements: HTMLElement[], maximum = 16) => {
		// A variance-matched approximation to a 5.2ms exposure, not temporal motion blur.
		// Keep its radius below 20px and update only artwork, never inherited root styles.
		const exposure = Math.min(maximum, (Math.abs(velocity) * 5.2) / Math.sqrt(12));
		for (const target of targets) if (!elements.includes(target)) target.style.filter = "";
		targets = elements;
		blur.setAttribute("stdDeviation", `${exposure.toFixed(2)} 0`);
		for (const target of targets)
			target.style.filter = exposure > 0.1 ? `url(#${filter.id})` : "";
	};
	return {
		update,
		clear: () => update(0, []),
		destroy: () => {
			update(0, []);
			svg.remove();
		},
	};
}

/** One viewport of travel; skipped indices never multiply the distance or duration. */
export function galleryTravelDuration(width: number) {
	return Math.round(Math.min(280, Math.max(220, 200 + width / 18)));
}

/** Sine ease-in-out with a decaying velocity carry when an in-flight move is retargeted. */
export function galleryTravel(progress: number, velocity = 0) {
	const time = Math.min(1, Math.max(0, progress));
	return (1 - Math.cos(Math.PI * time)) / 2 + velocity * time * (1 - time) ** 3;
}

/** The travel curve's derivative, in normalized distance per normalized time. */
export function galleryTravelSpeed(progress: number, velocity = 0) {
	if (progress < 0 || progress >= 1) return 0;
	return (
		(Math.PI * Math.sin(Math.PI * progress)) / 2 +
		velocity * (1 - progress) ** 2 * (1 - 4 * progress)
	);
}
