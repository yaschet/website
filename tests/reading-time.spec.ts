import { expect, test } from "@playwright/test";
import { calculateReadingTime } from "../src/content/reading-time";

test("reading time excludes metadata and mixed-media configuration", () => {
	const prose = Array.from({ length: 200 }, () => "word").join(" ");
	const gallery = `<Gallery\n items={[{"kind":"image","src":"/evidence.png","caption":"${prose}"}]}\n/>`;
	const source = `export const metadata = {\n"description":"${prose}"\n};\n\n${prose}\n\n${gallery}`;
	expect(calculateReadingTime(source)).toBe(1);
	expect(calculateReadingTime(`${source}\n\nOne more word.`)).toBe(2);
});

test("reading time retains ordinary Markdown paragraphs, lists and technical prose", () => {
	const paragraph = Array.from({ length: 199 }, () => "word").join(" ");
	expect(calculateReadingTime(`# Heading\n\n${paragraph}\n\n- Review the result.`)).toBe(2);
	expect(calculateReadingTime("")).toBe(1);
});
