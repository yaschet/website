"use client";

import { useState } from "react";
import styles from "./gallery-viewer.module.css";

const PLACES = [100, 10, 1];

/** Changed digits travel one step, including carries; no sweep through unrelated numbers. */
export function GalleryZoomReadout({ value }: { value: string }) {
	const number = Number.parseInt(value, 10) || 100;
	const [frame, setFrame] = useState({ current: number, previous: number });
	if (frame.current !== number) {
		setFrame({ current: number, previous: frame.current });
	}
	return (
		<span className={styles.zoomReadout} aria-hidden="true" data-fit={value === "Fit"}>
			<span data-label="Fit" className={styles.zoomFit} />
			<span className={styles.zoomNumber}>
				{PLACES.map((place) => {
					const digit = Math.floor(number / place) % 10;
					const previous = Math.floor(frame.previous / place) % 10;
					return (
						<span key={place} className={styles.zoomDigit}>
							<span key={digit} data-rolling={digit !== previous || undefined}>
								<i data-digit={previous} />
								<i data-digit={digit} />
							</span>
						</span>
					);
				})}
				<span data-label="%" className={styles.zoomUnit} />
			</span>
		</span>
	);
}
