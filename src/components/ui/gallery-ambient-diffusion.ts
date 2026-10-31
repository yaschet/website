const width = 96;
const height = 54;

/** Three box passes approximate a Gaussian at the light field's tiny resolution. */
function radii(sigma: number) {
	const ideal = Math.floor(Math.sqrt(4 * sigma ** 2 + 1));
	const lower = ideal % 2 === 0 ? ideal - 1 : ideal;
	const upper = lower + 2;
	const count = Math.round(
		(12 * sigma ** 2 - 3 * lower ** 2 - 12 * lower - 9) / (-4 * lower - 4),
	);
	return Array.from({ length: 3 }, (_, pass) => ((pass < count ? lower : upper) - 1) / 2);
}

function boxPass(source: Float32Array, target: Float32Array, radius: number, vertical: boolean) {
	const length = vertical ? height : width;
	const lines = vertical ? width : height;
	const stride = vertical ? width * 4 : 4;
	const divisor = radius * 2 + 1;
	for (let line = 0; line < lines; line++) {
		const start = vertical ? line * 4 : line * width * 4;
		for (let channel = 0; channel < 4; channel++) {
			let sum = 0;
			for (let index = 0; index <= Math.min(radius, length - 1); index++)
				sum += source[start + index * stride + channel];
			for (let index = 0; index < length; index++) {
				target[start + index * stride + channel] = sum / divisor;
				if (index + radius + 1 < length)
					sum += source[start + (index + radius + 1) * stride + channel];
				if (index - radius >= 0) sum -= source[start + (index - radius) * stride + channel];
			}
		}
	}
}

/** Diffuse premultiplied linear light before enlargement; no full-screen CSS filter. */
export function createGalleryAmbientDiffusion() {
	const scratch = new Float32Array(width * height * 4);
	return (pixels: Float32Array) => {
		// The canvas extends 10% past each viewport edge. Match an 80 CSS-pixel spread.
		const horizontal = radii((80 * width) / (innerWidth * 1.2));
		const vertical = radii((80 * height) / (innerHeight * 1.2));
		for (let pass = 0; pass < 3; pass++) {
			boxPass(pixels, scratch, horizontal[pass], false);
			boxPass(scratch, pixels, vertical[pass], true);
		}
		return pixels;
	};
}
