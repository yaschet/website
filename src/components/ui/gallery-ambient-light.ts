import { createGalleryAmbientDiffusion } from "./gallery-ambient-diffusion";
import { paintGalleryAmbientFrame } from "./gallery-ambient-frame";

const duration = 240;
const linear = Float32Array.from({ length: 256 }, (_, value) => {
	const channel = value / 255;
	return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
});
const encoded = Uint8ClampedArray.from({ length: 4097 }, (_, value) => {
	const channel = value / 4096;
	return 255 * (channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055);
});

function lightPixels(image: ImageData) {
	const light = new Float32Array(image.data.length);
	for (let offset = 0; offset < light.length; offset += 4) {
		const alpha = image.data[offset + 3] / 255;
		for (let channel = 0; channel < 3; channel++)
			light[offset + channel] = linear[image.data[offset + channel]] * alpha;
		light[offset + 3] = alpha;
	}
	return light;
}

/** A stationary light field. Retarget from the last painted light, never a stale image. */
export function createGalleryAmbientLight(context: CanvasRenderingContext2D) {
	const buffer = document.createElement("canvas");
	buffer.width = 96;
	buffer.height = 54;
	const sampling = buffer.getContext("2d", { willReadFrequently: true });
	const diffuse = createGalleryAmbientDiffusion();
	const current = new Float32Array(96 * 54 * 4);
	let frame: number | undefined;
	let from: Float32Array | undefined;
	let target: Float32Array | undefined;
	let pixels: ImageData | undefined;
	let started = 0;
	let painted = false;
	const stop = () => {
		if (frame !== undefined) cancelAnimationFrame(frame);
		frame = undefined;
		from = undefined;
	};
	const sample = (source: CanvasImageSource) => {
		if (!sampling) return;
		paintGalleryAmbientFrame(sampling, source);
		pixels = sampling.getImageData(0, 0, 96, 54);
		target = diffuse(lightPixels(pixels));
	};
	const paint = (weight: number) => {
		if (!target || !pixels) return;
		// Blend premultiplied linear light, preserving energy through transparent pixels.
		for (let offset = 0; offset < pixels.data.length; offset += 4) {
			for (let channel = 0; channel < 4; channel++) {
				const index = offset + channel;
				current[index] = from
					? from[index] + (target[index] - from[index]) * weight
					: target[index];
			}
			const alpha = current[offset + 3];
			for (let channel = 0; channel < 3; channel++) {
				const index = offset + channel;
				const value = current[index];
				pixels.data[index] =
					alpha > 0
						? encoded[Math.max(0, Math.min(4096, Math.round((value / alpha) * 4096)))]
						: 0;
			}
			pixels.data[offset + 3] = alpha * 255;
		}
		context.putImageData(pixels, 0, 0);
	};
	const blend = (time: number) => {
		if (!from) return;
		const progress = Math.min(1, Math.max(0, (time - started) / duration));
		paint(1 - (1 - progress) ** 3);
		if (progress < 1) frame = requestAnimationFrame(blend);
		else stop();
	};
	return {
		begin(source: CanvasImageSource, immediate: boolean) {
			stop();
			sample(source);
			if (!pixels) return;
			if (!painted || immediate) paint(1);
			else {
				from = current.slice();
				started = performance.now();
				frame = requestAnimationFrame(blend);
			}
			painted = true;
		},
		present(source: CanvasImageSource) {
			sample(source);
			// Presented video frames replace the target without restarting adaptation.
			if (!from) paint(1);
		},
		stop,
	};
}
