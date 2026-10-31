"use client";

import styles from "./gallery-viewer.module.css";

const DIGITS = Array.from({ length: 10 }, (_, digit) => digit);
const PLACES = [100, 10, 1];

/** Persistent decimal reels retarget from their current position, including during a pinch. */
export function GalleryZoomReadout({ value }: { value: string }) {
	const number = Number.parseInt(value, 10) || 100;
	return (
		<span className={styles.zoomReadout} aria-hidden="true" data-fit={value === "Fit"}>
			<span data-label="Fit" className={styles.zoomFit} />
			<span className={styles.zoomNumber}>
				{PLACES.map((place) => (
					<span key={place} className={styles.zoomDigit}>
						<span
							style={{
								transform: `translateY(-${(Math.floor(number / place) % 10) * 20}px)`,
							}}
						>
							{DIGITS.map((number) => (
								<i key={number} data-digit={number} />
							))}
						</span>
					</span>
				))}
				<span data-label="%" className={styles.zoomUnit} />
			</span>
		</span>
	);
}
