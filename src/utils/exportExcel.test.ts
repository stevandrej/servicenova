import { describe, expect, it } from "vitest";
import { COLUMNS } from "./exportExcel";
import { CSV_HEADERS, ServiceRow } from "./exportVehicles";

const row: ServiceRow = {
	make: "Mazda",
	model: "3",
	year: 2019,
	plate: "SK-8118-BV",
	serviceDate: new Date("2026-03-10T00:00:00Z"),
	serviceType: "Oil change",
	mileage: 120000,
	price: 4500,
	nextServiceDate: null,
	notes: "routine",
};

/** The cell definition for a column, by its header. */
const cellFor = (header: string) => {
	const column = COLUMNS.find((c) => c.header === header);
	if (!column) throw new Error(`no column titled ${header}`);
	return column.cell(row, 0);
};

describe("Excel columns", () => {
	it("matches the CSV columns, so both exports carry the same data", () => {
		expect(COLUMNS.map((c) => c.header)).toEqual([...CSV_HEADERS]);
	});

	it("gives every column a usable width", () => {
		for (const column of COLUMNS) {
			expect(column.width, `width for ${String(column.header)}`)
				.toBeGreaterThan(0);
			expect(column.width).toBeLessThan(100);
		}
	});

	it("writes plain text straight through", () => {
		expect(cellFor("Make")).toBe("Mazda");
		expect(cellFor("Notes")).toBe("routine");
	});

	// Typed cells are the whole point of offering Excel alongside CSV: a text
	// column cannot be summed or charted without retyping it first.
	it("writes mileage and price as numbers, not text", () => {
		expect(cellFor("Mileage (km)")).toMatchObject({
			type: Number,
			value: 120000,
		});
		expect(cellFor("Price (MKD)")).toMatchObject({
			type: Number,
			value: 4500,
		});
	});

	it("writes dates as real dates on the correct calendar day", () => {
		const cell = cellFor("Service Date") as {
			type: unknown;
			value: Date;
			format: string;
		};

		expect(cell.type).toBe(Date);
		expect(cell.format).toBe("dd/mm/yyyy");
		expect(cell.value.getFullYear()).toBe(2026);
		expect(cell.value.getMonth()).toBe(2); // March
		expect(cell.value.getDate()).toBe(10);
	});

	it("leaves a missing date empty rather than writing epoch zero", () => {
		expect(cellFor("Next Service Date")).toMatchObject({ value: undefined });
	});
});
