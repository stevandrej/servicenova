import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import {
	dateToFirebaseTimestamp,
	firebaseTimestampToDate,
	formatDate,
	formatDayMonth,
	formatDateToLongDate,
} from "./formatDate";

const date = new Date("2026-11-20T00:00:00Z");

describe("formatDate", () => {
	it("renders day-first with dashes", () => {
		expect(formatDate(date)).toBe("20-11-2026");
	});

	it("zero-pads single-digit days and months", () => {
		expect(formatDate(new Date("2026-03-07T00:00:00Z"))).toBe("07-03-2026");
	});
});

describe("formatDateToLongDate", () => {
	it("spells out the month", () => {
		expect(formatDateToLongDate(date)).toBe("20 November 2026");
	});
});

describe("formatDayMonth", () => {
	it("renders the compact day and short month", () => {
		expect(formatDayMonth(date)).toBe("20 Nov");
	});
});

// Dates are stored as UTC-midnight day values. Formatting in local time would
// show the previous day to anyone west of UTC, which is the bug the explicit
// timeZone: "UTC" in these formatters exists to prevent.
describe("timezone handling", () => {
	it("keeps UTC midnight on its own calendar day", () => {
		const utcMidnight = new Date("2026-01-01T00:00:00Z");
		expect(formatDate(utcMidnight)).toBe("01-01-2026");
		expect(formatDateToLongDate(utcMidnight)).toBe("1 January 2026");
	});

	it("does not roll over for a late-evening UTC time", () => {
		expect(formatDate(new Date("2026-01-01T23:30:00Z"))).toBe("01-01-2026");
	});
});

describe("Firestore timestamp conversion", () => {
	it("round-trips a date", () => {
		const restored = firebaseTimestampToDate(dateToFirebaseTimestamp(date));
		expect(restored.getTime()).toBe(date.getTime());
	});

	it("produces a real Firestore Timestamp", () => {
		expect(dateToFirebaseTimestamp(date)).toBeInstanceOf(Timestamp);
	});
});
