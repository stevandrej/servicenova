import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	DUE_SOON_DAYS,
	UPCOMING_DAYS,
	getServiceUrgency,
	getVehiclesDue,
	getVehiclesNeedingAttention,
} from "./serviceDue";
import { TVehicleWithServices } from "../types/vehicle.type";

// Midnight UTC keeps the day arithmetic exact: daysUntil floors the difference,
// so a mid-day "now" would push every same-day date onto the previous day.
const NOW = new Date("2026-01-01T00:00:00Z");

/** A date `days` from the frozen now. Negative for the past. */
const dayOffset = (days: number) =>
	new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(NOW);
});

afterEach(() => {
	vi.useRealTimers();
});

describe("getServiceUrgency", () => {
	it("returns none when no next service is scheduled", () => {
		expect(getServiceUrgency(null)).toBe("none");
		expect(getServiceUrgency(undefined)).toBe("none");
	});

	it("treats today as due-soon rather than overdue", () => {
		expect(getServiceUrgency(dayOffset(0))).toBe("due-soon");
	});

	it("returns overdue once the date has passed", () => {
		expect(getServiceUrgency(dayOffset(-1))).toBe("overdue");
		expect(getServiceUrgency(dayOffset(-400))).toBe("overdue");
	});

	// The thresholds drive the colour of every vehicle card, so the exact
	// boundaries are worth pinning down.
	it("includes the DUE_SOON_DAYS boundary in due-soon", () => {
		expect(getServiceUrgency(dayOffset(DUE_SOON_DAYS))).toBe("due-soon");
		expect(getServiceUrgency(dayOffset(DUE_SOON_DAYS + 1))).toBe("upcoming");
	});

	it("includes the UPCOMING_DAYS boundary in upcoming", () => {
		expect(getServiceUrgency(dayOffset(UPCOMING_DAYS))).toBe("upcoming");
		expect(getServiceUrgency(dayOffset(UPCOMING_DAYS + 1))).toBe("ok");
	});
});

describe("getVehiclesDue", () => {
	it("keeps only overdue and due-soon vehicles", () => {
		const vehicles = [
			{ id: "overdue", nextServiceDate: dayOffset(-5) },
			{ id: "due-soon", nextServiceDate: dayOffset(10) },
			{ id: "upcoming", nextServiceDate: dayOffset(60) },
			{ id: "ok", nextServiceDate: dayOffset(200) },
			{ id: "none", nextServiceDate: null },
		];

		expect(getVehiclesDue(vehicles).map((v) => v.id)).toEqual([
			"overdue",
			"due-soon",
		]);
	});
});

describe("getVehiclesNeedingAttention", () => {
	const vehicle = (
		id: string,
		nextServiceDate: Date | null,
		lastServiceDaysAgo?: number
	): TVehicleWithServices => ({
		id,
		make: "Make",
		model: "Model",
		year: 2020,
		plate: `PLATE-${id}`,
		nextServiceDate,
		services:
			lastServiceDaysAgo === undefined
				? []
				: [
						{
							id: `${id}-s1`,
							date: dayOffset(-lastServiceDaysAgo),
							mileage: 1000,
							price: 100,
							serviceType: "Oil change",
							notes: "",
							nextServiceDate,
						},
					],
	});

	it("includes vehicles that have never been serviced", () => {
		const never = vehicle("never", null);
		expect(getVehiclesNeedingAttention([never]).map((v) => v.id)).toEqual([
			"never",
		]);
	});

	it("excludes a recently serviced vehicle with a distant next service", () => {
		const healthy = vehicle("healthy", dayOffset(200), 10);
		expect(getVehiclesNeedingAttention([healthy])).toEqual([]);
	});

	it("includes a vehicle not serviced in a long time even with no next date", () => {
		const stale = vehicle("stale", null, 400);
		expect(getVehiclesNeedingAttention([stale]).map((v) => v.id)).toEqual([
			"stale",
		]);
	});

	it("orders overdue before due-soon before never-serviced", () => {
		const result = getVehiclesNeedingAttention([
			vehicle("never", null),
			vehicle("due-soon", dayOffset(10), 5),
			vehicle("overdue", dayOffset(-10), 5),
		]);

		expect(result.map((v) => v.id)).toEqual(["overdue", "due-soon", "never"]);
	});
});
