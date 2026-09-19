/**
 * U+FEFF. Built from its code point rather than written literally, since a raw
 * byte-order mark in source is invisible and trips the no-irregular-whitespace
 * lint rule.
 */
const BYTE_ORDER_MARK = String.fromCharCode(0xfeff);

/**
 * Saves in-memory text as a file. Kept apart from the export formatters so
 * those stay pure and testable, since this half only works in a browser.
 */
export function downloadTextFile(
	filename: string,
	content: string,
	mimeType: "text/csv" | "application/json"
) {
	// Excel reads a UTF-8 CSV as the system codepage unless it opens with a
	// byte-order mark, which mangles any non-ASCII text in the notes.
	const body =
		mimeType === "text/csv" ? `${BYTE_ORDER_MARK}${content}` : content;

	const url = URL.createObjectURL(
		new Blob([body], { type: `${mimeType};charset=utf-8` })
	);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}
