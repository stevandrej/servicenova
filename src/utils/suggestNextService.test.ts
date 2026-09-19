import { describe, expect, it } from "vitest";
import { addMonthsUtc, suggestNextServiceDate } from "./serviceDue";
import { getServiceIntervalMonths } from "./serviceTypes";

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("addMonthsUtc", () => {
	it("adds whole months", () => {
		expect(addMonthsUtc(utc("2026-01-15"), 12)).toEqual(utc("2027-01-15"));
		expect(addMonthsUtc(utc("2026-01-15"), 24)).toEqual(utc("2028-01-15"));
	});

	it("rolls over the year boundary", () => {
		expect(addMonthsUtc(utc("2026-11-20"), 12)).toEqual(utc("2027-11-20"));
	});

	// Naive month arithmetic turns 31 January into 3 March; the clamp is what
	// keeps a suggested date inside the month the user would expect.
	it("clamps to the last day of a shorter target month", () => {
		expect(addMonthsUtc(utc("2026-01-31"), 1)).toEqual(utc("2026-02-28"));
		expect(addMonthsUtc(utc("2026-03-31"), 1)).toEqual(utc("2026-04-30"));
	});

	it("handles a leap day rolling into a non-leap year", () => {
		expect(addMonthsUtc(utc("2028-02-29"), 12)).toEqual(utc("2029-02-28"));
	});

	it("stays at UTC midnight", () => {
		expect(addMonthsUtc(utc("2026-06-10"), 12).toISOString()).toBe(
			"2027-06-10T00:00:00.000Z"
		);
	});
});

describe("getServiceIntervalMonths", () => {
	it("gives an oil change a one-year interval", () => {
		expect(getServiceIntervalMonths("Oil change")).toBe(12);
	});

	it("matches free text rather than exact preset labels", () => {
		expect(getServiceIntervalMonths("engine oil + filter")).toBe(12);
		expect(getServiceIntervalMonths("BRAKE PADS")).toBe(24);
	});

	it("returns null for jobs that are not on a schedule", () => {
		expect(getServiceIntervalMonths("Bodywork")).toBeNull();
		expect(getServiceIntervalMonths("Cleaning")).toBeNull();
	});

	it("returns null for an unrecognized service type", () => {
		expect(getServiceIntervalMonths("something entirely made up")).toBeNull();
	});

	// The presets match on word starts. Without that, "entirely" contains
	// "tire" and "spoiled" contains "oil", so unrelated notes were silently
	// classified as tyre and oil services.
	it("only matches at a word start", () => {
		expect(getServiceIntervalMonths("entirely replaced")).toBeNull();
		expect(getServiceIntervalMonths("spoiled interior")).toBeNull();
		expect(getServiceIntervalMonths("highlight trim")).toBeNull();
	});

	it("still matches word prefixes and plurals", () => {
		expect(getServiceIntervalMonths("battery replaced")).toBe(48);
		expect(getServiceIntervalMonths("brakes and discs")).toBe(24);
		expect(getServiceIntervalMonths("wheel alignment")).toBe(24);
		expect(getServiceIntervalMonths("annual inspection")).toBe(12);
	});
});

describe("suggestNextServiceDate", () => {
	it("suggests one year out for an oil change", () => {
		expect(suggestNextServiceDate(utc("2026-03-10"), "Oil change")).toEqual(
			utc("2027-03-10")
		);
	});

	it("uses the longer interval for a timing belt", () => {
		expect(suggestNextServiceDate(utc("2026-03-10"), "Timing belt")).toEqual(
			utc("2031-03-10")
		);
	});

	it("suggests nothing for a one-off job", () => {
		expect(suggestNextServiceDate(utc("2026-03-10"), "Bodywork")).toBeNull();
	});

	it("suggests nothing for an unrecognized type", () => {
		expect(suggestNextServiceDate(utc("2026-03-10"), "")).toBeNull();
	});
});
