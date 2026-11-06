const WORDS_PER_MINUTE = 200;

function stripMetadataExport(source: string) {
	return source.replace(/^export\s+const\s+metadata\s*=\s*{[\s\S]*?^}\s*;?\s*$/m, "").trim();
}

export function calculateReadingTime(source: string) {
	// Media configuration is authored alongside prose, but is not reading content.
	const prose = stripMetadataExport(source).replace(/^<[A-Z][A-Za-z0-9]*\b[\s\S]*?\/>\s*$/gm, "");
	const wordCount = prose.split(/\s+/g).filter(Boolean).length;
	return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
