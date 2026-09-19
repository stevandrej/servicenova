import { describe, expect, it } from "vitest";
import { CURRENCY, formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
	it("appends the currency code", () => {
		expect(formatCurrency(100)).toBe(`100 ${CURRENCY}`);
	});

	it("groups thousands", () => {
		expect(formatCurrency(12500)).toBe(`12,500 ${CURRENCY}`);
	});

	it("rounds to whole units", () => {
		expect(formatCurrency(99.4)).toBe(`99 ${CURRENCY}`);
		expect(formatCurrency(99.5)).toBe(`100 ${CURRENCY}`);
	});

	it("handles zero", () => {
		expect(formatCurrency(0)).toBe(`0 ${CURRENCY}`);
	});
});
