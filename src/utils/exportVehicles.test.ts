import { describe, expect, it } from "vitest";
import {
	CSV_HEADERS,
	buildServiceRows,
	exportFilename,
	slugify,
	toSpreadsheetDate,
	vehicleSlug,
	vehiclesToCsv,
	vehiclesToJson,
} from "./exportVehicles";
import { TVehicleWithServices } from "../types/vehicle.type";
import { TService } from "../types/service.type";

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

const service = (over: Partial<TService> = {}): TService => ({
	id: "s1",
	date: utc("2026-03-10"),
	mileage: 120000,
	price: 4500,
	serviceType: "Oil change",
	notes: "",
	nextServiceDate: utc("2027-03-10"),
	...over,
});

const vehicle = (
	over: Partial<TVehicleWithServices> = {}
): TVehicleWithServices => ({
	id: "v1",
	make: "Mazda",
	model: "3",
	year: 2019,
	plate: "SK-8118-BV",
	nextServiceDate: utc("2027-03-10"),
	services: [service()],
	...over,
});

const rows = (csv: string) => csv.split("\r\n");

describe("vehiclesToCsv", () => {
	it("starts with the header row", () => {
		expect(rows(vehiclesToCsv([]))[0]).toBe(CSV_HEADERS.join(","));
	});

	it("writes one row per service", () => {
		const csv = vehiclesToCsv([
			vehicle({
				services: [
					service({ id: "a", serviceType: "Oil change" }),
					service({ id: "b", serviceType: "Brakes" }),
				],
			}),
		]);

		expect(rows(csv)).toHaveLength(3); // header + 2 services
		expect(rows(csv)[1]).toContain("Oil change");
		expect(rows(csv)[2]).toContain("Brakes");
	});

	it("uses ISO dates so a spreadsheet sorts them correctly", () => {
		const csv = vehiclesToCsv([vehicle()]);
		expect(rows(csv)[1]).toContain("2026-03-10");
		expect(rows(csv)[1]).toContain("2027-03-10");
	});

	// A car that has never been serviced is still part of the garage, and an
	// export that silently dropped it would be a misleading backup.
	it("still emits a row for a vehicle with no services", () => {
		const csv = vehiclesToCsv([
			vehicle({ services: [], nextServiceDate: null }),
		]);

		expect(rows(csv)).toHaveLength(2);
		expect(rows(csv)[1]).toBe("Mazda,3,2019,SK-8118-BV,,,,,,");
	});

	describe("escaping", () => {
		it("quotes a field containing a comma", () => {
			const csv = vehiclesToCsv([
				vehicle({ services: [service({ notes: "oil, filter and check" })] }),
			]);
			expect(rows(csv)[1]).toContain('"oil, filter and check"');
		});

		it("doubles embedded quotes", () => {
			const csv = vehiclesToCsv([
				vehicle({ services: [service({ notes: 'used "premium" oil' })] }),
			]);
			expect(rows(csv)[1]).toContain('"used ""premium"" oil"');
		});

		it("quotes a field containing a newline without breaking the row count", () => {
			const csv = vehiclesToCsv([
				vehicle({ services: [service({ notes: "line one\nline two" })] }),
			]);
			expect(csv).toContain('"line one\nline two"');
			// The embedded newline is inside quotes, so it is not a row break.
			expect(rows(csv)).toHaveLength(2);
		});

		it("leaves ordinary text unquoted", () => {
			const csv = vehiclesToCsv([
				vehicle({ services: [service({ notes: "routine" })] }),
			]);
			expect(rows(csv)[1]).toContain(",routine");
			expect(rows(csv)[1]).not.toContain('"routine"');
		});
	});
});

describe("vehiclesToJson", () => {
	it("round-trips through JSON.parse", () => {
		const parsed = JSON.parse(vehiclesToJson([vehicle()]));

		expect(parsed.vehicles).toHaveLength(1);
		expect(parsed.vehicles[0].plate).toBe("SK-8118-BV");
		expect(parsed.vehicles[0].services[0].serviceType).toBe("Oil change");
	});

	it("serialises dates as ISO days and missing dates as null", () => {
		const parsed = JSON.parse(
			vehiclesToJson([
				vehicle({
					nextServiceDate: null,
					services: [service({ nextServiceDate: null })],
				}),
			])
		);

		expect(parsed.vehicles[0].nextServiceDate).toBeNull();
		expect(parsed.vehicles[0].services[0].nextServiceDate).toBeNull();
		expect(parsed.vehicles[0].services[0].date).toBe("2026-03-10");
	});

	it("records the currency the prices are in", () => {
		expect(JSON.parse(vehiclesToJson([])).currency).toBeTruthy();
	});

	it("handles a vehicle with no services array", () => {
		const bare = { ...vehicle() } as TVehicleWithServices;
		// Firestore can hand back a vehicle before its services resolve.
		delete (bare as Partial<TVehicleWithServices>).services;

		expect(() => vehiclesToJson([bare])).not.toThrow();
		expect(JSON.parse(vehiclesToJson([bare])).vehicles[0].services).toEqual(
			[]
		);
	});
});

describe("exportFilename", () => {
	const now = utc("2026-09-19");

	it("stamps the date into the name", () => {
		expect(exportFilename("csv", { now })).toBe("service-nova-2026-09-19.csv");
		expect(exportFilename("json", { now })).toBe(
			"service-nova-2026-09-19.json"
		);
		expect(exportFilename("xlsx", { now })).toBe(
			"service-nova-2026-09-19.xlsx"
		);
	});

	it("includes the slug for a single-vehicle export", () => {
		expect(exportFilename("xlsx", { slug: "ford-mondeo-sk-208-sv", now })).toBe(
			"service-nova-ford-mondeo-sk-208-sv-2026-09-19.xlsx"
		);
	});
});

describe("slugify", () => {
	it("lowercases and hyphenates", () => {
		expect(slugify("Ford Mondeo")).toBe("ford-mondeo");
	});

	it("collapses runs of punctuation and trims the edges", () => {
		expect(slugify("  SK-208 / SV!  ")).toBe("sk-208-sv");
	});

	it("drops characters that are unsafe in a filename", () => {
		expect(slugify('a/b\\c:d*e?f"g<h>i|j')).toBe("a-b-c-d-e-f-g-h-i-j");
	});
});

describe("vehicleSlug", () => {
	it("combines make, model and plate", () => {
		expect(vehicleSlug(vehicle())).toBe("mazda-3-sk-8118-bv");
	});
});

describe("buildServiceRows", () => {
	it("flattens each service against its vehicle", () => {
		const rows = buildServiceRows([vehicle()]);

		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({
			make: "Mazda",
			plate: "SK-8118-BV",
			serviceType: "Oil change",
			mileage: 120000,
			price: 4500,
		});
	});

	it("keeps values typed rather than pre-formatted", () => {
		const [row] = buildServiceRows([vehicle()]);

		expect(row.serviceDate).toBeInstanceOf(Date);
		expect(typeof row.mileage).toBe("number");
	});

	it("emits a single empty-service row for an unserviced vehicle", () => {
		const rows = buildServiceRows([
			vehicle({ services: [], nextServiceDate: utc("2027-01-01") }),
		]);

		expect(rows).toHaveLength(1);
		expect(rows[0].serviceDate).toBeNull();
		expect(rows[0].mileage).toBeNull();
		// The vehicle's own reminder is still worth carrying through.
		expect(rows[0].nextServiceDate).toEqual(utc("2027-01-01"));
	});
});

// A spreadsheet cell has no timezone, so the stored UTC instant has to be
// rebuilt as the same calendar day locally or Excel shows the day before to
// anyone west of UTC.
describe("toSpreadsheetDate", () => {
	it("keeps the calendar day the app displays", () => {
		const cell = toSpreadsheetDate(utc("2026-03-10"));

		expect(cell?.getFullYear()).toBe(2026);
		expect(cell?.getMonth()).toBe(2); // March
		expect(cell?.getDate()).toBe(10);
	});

	it("returns local midnight, not the UTC instant", () => {
		expect(toSpreadsheetDate(utc("2026-03-10"))?.getHours()).toBe(0);
	});

	it("passes null through", () => {
		expect(toSpreadsheetDate(null)).toBeNull();
		expect(toSpreadsheetDate(undefined)).toBeNull();
	});
});
