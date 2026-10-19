import { readFileSync } from "node:fs";

const message = process.env.PR_TITLE ?? readFileSync(process.argv[2], "utf8");
const [subject, separator] = message.trimEnd().split(/\r?\n/);
const conventional =
	/^(feat|fix|refactor|perf|test|docs|build|ci|chore|revert)\([a-z][a-z0-9-]*\)!?: [a-z].+$/;
const generated = /^(Merge (?:branch|pull request|remote-tracking branch) |Revert ").+/;

if (!generated.test(subject) && (!conventional.test(subject) || subject.length > 72)) {
	process.stderr.write(
		"Use type(scope): imperative summary, within 72 characters. See docs/version-control.md.\n",
	);
	process.exitCode = 1;
} else if (separator !== undefined && separator !== "") {
	process.stderr.write("Separate the commit subject and body with a blank line.\n");
	process.exitCode = 1;
}
