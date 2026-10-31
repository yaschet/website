/** Spill chromatic light without turning white interfaces into a gray backdrop. */
export function paintGalleryAmbientFrame(
	context: CanvasRenderingContext2D,
	frame: CanvasImageSource,
) {
	context.clearRect(0, 0, 96, 54);
	context.drawImage(frame, 0, 0, 96, 54);
	const light = context.getImageData(0, 0, 96, 54);
	for (let offset = 0; offset < light.data.length; offset += 4) {
		const red = light.data[offset];
		const green = light.data[offset + 1];
		const blue = light.data[offset + 2];
		const floor = Math.min(red, green, blue);
		const chroma = Math.max(red, green, blue) - floor;
		const gain = chroma > 0 ? 255 / chroma : 0;
		light.data[offset] = (red - floor) * gain;
		light.data[offset + 1] = (green - floor) * gain;
		light.data[offset + 2] = (blue - floor) * gain;
		light.data[offset + 3] = Math.min(1, chroma / 96) * 255;
	}
	context.putImageData(light, 0, 0);
}
