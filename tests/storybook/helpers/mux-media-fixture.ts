import type { Page } from "@playwright/test";

/**
 * Keep UI contracts independent of Mux delivery and autoplay policy. The real
 * component retains its controls, event wiring and gallery lifecycle; only the
 * custom element's public transport boundary is controlled. This does not test
 * decoding, real audio, adaptive delivery or native Safari fullscreen.
 */
export async function installMuxMediaFixture(page: Page) {
	await page.route(/https:\/\/stream\.mux\.(com|dev)\//, (route) => route.abort());
	await page.addInitScript(() => {
		const define = CustomElementRegistry.prototype.define;
		CustomElementRegistry.prototype.define = function (name, elementClass, options) {
			if (name === "mux-video") {
				const states = new Map<
					HTMLElement,
					{ paused: boolean; time: number; source: string }
				>();
				const state = (media: HTMLElement) => {
					let current = states.get(media);
					if (!current) {
						current = { paused: true, time: 0, source: "" };
						states.set(media, current);
					}
					return current;
				};
				const property = (key: string, descriptor: PropertyDescriptor) =>
					Object.defineProperty(elementClass.prototype, key, {
						configurable: true,
						...descriptor,
					});
				property("src", {
					get(this: HTMLElement) {
						return state(this).source;
					},
					set(this: HTMLElement, source: string) {
						state(this).source = source;
					},
				});
				property("currentSrc", {
					get(this: HTMLElement) {
						return state(this).source;
					},
				});
				property("paused", {
					get(this: HTMLElement) {
						return state(this).paused;
					},
				});
				property("currentTime", {
					get(this: HTMLElement) {
						return state(this).time;
					},
					set(this: HTMLElement, time: number) {
						state(this).time = time;
						this.dispatchEvent(new Event("timeupdate"));
					},
				});
				for (const [key, value] of Object.entries({
					readyState: 4,
					duration: 100,
					videoWidth: 1280,
					videoHeight: 720,
				}))
					property(key, { get: () => value });
				property("load", { value() {} });
				property("unload", {
					value(this: HTMLElement) {
						state(this).paused = true;
					},
				});
				property("play", {
					value(this: HTMLElement) {
						state(this).paused = false;
						this.dispatchEvent(new Event("play"));
						if (!state(this).paused) this.dispatchEvent(new Event("playing"));
						return Promise.resolve();
					},
				});
				property("pause", {
					value(this: HTMLElement) {
						const current = state(this);
						if (current.paused) return;
						current.paused = true;
						this.dispatchEvent(new Event("pause"));
					},
				});
				setInterval(() => {
					for (const [media, current] of states) {
						if (!media.isConnected || current.paused) continue;
						current.time += 0.1;
						media.dispatchEvent(new Event("timeupdate"));
					}
				}, 100);
			}
			return define.call(this, name, elementClass, options);
		};
	});
}
