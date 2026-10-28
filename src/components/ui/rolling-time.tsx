import type { CSSProperties } from "react";

const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const places = [
	"hour-tens",
	"hour-ones",
	"hour-separator",
	"minute-tens",
	"minute-ones",
	"minute-separator",
	"second-tens",
	"second-ones",
];

/** Office's masked digit columns, adapted to stable HH:MM:SS positions without a render loop. */
export function RollingTime({
	value,
	instant = false,
}: {
	value: string | null;
	instant?: boolean;
}) {
	return (
		<span
			className="portfolio-clock-readout"
			data-ready={value !== null}
			data-instant={instant || undefined}
			aria-hidden="true"
		>
			<span className="portfolio-clock-placeholder">--:--:--</span>
			<span className="portfolio-clock-digits">
				{Array.from(value ?? "00:00:00", (character, index) =>
					character === ":" ? (
						<span key={places[index]} className="portfolio-clock-separator">
							:
						</span>
					) : (
						<span key={places[index]} className="portfolio-clock-digit">
							<span style={{ "--clock-digit": Number(character) } as CSSProperties}>
								{digits.map((digit) => (
									<i key={digit} data-digit={digit} />
								))}
							</span>
						</span>
					),
				)}
			</span>
		</span>
	);
}
