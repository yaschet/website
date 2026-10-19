/* Check public boundaries without printing source contents or credentials. */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const files = [
	...new Set(
		execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
			encoding: "utf8",
		})
			.split("\0")
			.filter((path) => path && existsSync(path)),
	),
];
const failures = [];
const generated =
	/^(?:\.next|node_modules|coverage|playwright-report|test-results|storybook-static|output|\.firecrawl)\//;
const privateFile = /(?:^|\/)(?:\.env(?:\..+)?|[^/]+\.(?:pem|key|p12|pfx)|id_(?:rsa|ed25519))$/;
const localDependency = /^(?:file:|link:|portal:|workspace:|\.\.\/|\/|[A-Za-z]:\\)/;

for (const path of files) {
	if (generated.test(path)) failures.push(`${path}: generated output must stay ignored.`);
	if (path !== ".env.example" && privateFile.test(path))
		failures.push(`${path}: private configuration or key file must stay ignored.`);
	if (!/\.(?:[cm]?[jt]sx?|json)$/.test(path)) continue;
	const source = readFileSync(path, "utf8");
	// Inspect module specifiers; portfolio prose may legitimately discuss private work.
	const imports = source.matchAll(
		/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\brequire\s*\(\s*)["']([^"']+)["']/g,
	);
	for (const [, specifier] of imports) {
		if (/^(?:@yaschet\/|(?:\.\.\/)+app(?:\/|$)|\/Users\/|[A-Za-z]:\\)/.test(specifier))
			failures.push(`${path}: import crosses the public repository boundary.`);
	}
}

const manifest = JSON.parse(readFileSync("package.json", "utf8"));
for (const group of ["dependencies", "devDependencies", "optionalDependencies"]) {
	for (const [name, version] of Object.entries(manifest[group] ?? {})) {
		if (localDependency.test(version))
			failures.push(
				`package.json: ${name} must resolve independently of local repositories.`,
			);
	}
}

if (failures.length) {
	process.stderr.write(`${failures.join("\n")}\n`);
	process.exitCode = 1;
} else {
	process.stdout.write("Public repository boundary checks passed.\n");
}
