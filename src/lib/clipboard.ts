/** Write on user intent, retaining a fallback for browsers without the async Clipboard API. */
export async function writeClipboardText(text: string) {
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		const focused = document.activeElement;
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "fixed";
		textarea.style.left = "-9999px";
		document.body.appendChild(textarea);
		textarea.select();
		try {
			if (!document.execCommand("copy")) throw new Error("Clipboard unavailable");
		} finally {
			textarea.remove();
			if (focused instanceof HTMLElement) focused.focus({ preventScroll: true });
		}
	}
}
