import { TVehicle, TVehicleWithServices } from "../types/vehicle.type";
import { CURRENCY } from "./formatCurrency";

/** ISO day (yyyy-mm-dd), which sorts correctly in a spreadsheet. */
function toIsoDay(date: Date | null | undefined): string {
	return date ? date.toISOString().split("T")[0] : "";
}

/** Quotes a CSV field only when it would otherwise break the row. */
function csvCell(value: string | number | null | undefined): string {
	if (value === null || value === undefined) return "";
	const text = String(value);
	return /["\n\r,]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * One service, flattened against its vehicle. Values stay typed rather than
 * pre-formatted so Excel can receive real dates and numbers; the CSV writer
 * stringifies them on its way out.
 */
export interface ServiceRow {
	make: string;
	model: string;
	year: number;
	plate: string;
	serviceDate: Date | null;
	serviceType: string;
	mileage: number | null;
	price: number | null;
	nextServiceDate: Date | null;
	notes: string;
}

/**
 * Flattens the fleet to one row per service. A vehicle with no services still
 * produces a row, so an export is a complete picture of the garage rather than
 * only its serviced cars. Shared by every export format.
 */
export function buildServiceRows(
	vehicles: TVehicleWithServices[]
): ServiceRow[] {
	const rows: ServiceRow[] = [];

	for (const vehicle of vehicles) {
		const base = {
			make: vehicle.make,
			model: vehicle.model,
			year: vehicle.year,
			plate: vehicle.plate,
		};

		if (!vehicle.services?.length) {
			rows.push({
				...base,
				serviceDate: null,
				serviceType: "",
				mileage: null,
				price: null,
				nextServiceDate: vehicle.nextServiceDate ?? null,
				notes: "",
			});
			continue;
		}

		for (const service of vehicle.services) {
			rows.push({
				...base,
				serviceDate: service.date,
				serviceType: service.serviceType,
				mileage: service.mileage,
				price: service.price,
				nextServiceDate: service.nextServiceDate,
				notes: service.notes,
			});
		}
	}

	return rows;
}

export const CSV_HEADERS = [
	"Make",
	"Model",
	"Year",
	"Plate",
	"Service Date",
	"Service Type",
	"Mileage (km)",
	`Price (${CURRENCY})`,
	"Next Service Date",
	"Notes",
] as const;

/** The fleet as CSV, one row per service. */
export function vehiclesToCsv(vehicles: TVehicleWithServices[]): string {
	const rows = buildServiceRows(vehicles).map((row) =>
		[
			row.make,
			row.model,
			row.year,
			row.plate,
			toIsoDay(row.serviceDate),
			row.serviceType,
			row.mileage,
			row.price,
			toIsoDay(row.nextServiceDate),
			row.notes,
		]
			.map(csvCell)
			.join(",")
	);

	// RFC 4180 line endings, which keeps Excel happy.
	return [CSV_HEADERS.join(","), ...rows].join("\r\n");
}

/** The full fleet as JSON, for a backup that can be read back in full. */
export function vehiclesToJson(vehicles: TVehicleWithServices[]): string {
	return JSON.stringify(
		{
			exportedAt: new Date().toISOString(),
			currency: CURRENCY,
			vehicles: vehicles.map((vehicle) => ({
				make: vehicle.make,
				model: vehicle.model,
				year: vehicle.year,
				plate: vehicle.plate,
				imageUrl: vehicle.imageUrl ?? null,
				nextServiceDate: toIsoDay(vehicle.nextServiceDate) || null,
				services: (vehicle.services ?? []).map((service) => ({
					date: toIsoDay(service.date),
					serviceType: service.serviceType,
					mileage: service.mileage,
					price: service.price,
					nextServiceDate: toIsoDay(service.nextServiceDate) || null,
					notes: service.notes,
				})),
			})),
		},
		null,
		2
	);
}

/**
 * Rebuilds a stored UTC-midnight day as the same calendar day in local time.
 * Spreadsheet cells carry no timezone, so handing Excel the raw UTC instant
 * shows the previous day to anyone west of UTC - the same trap the `en-GB`
 * formatters avoid by pinning `timeZone: "UTC"`.
 */
export function toSpreadsheetDate(date: Date | null | undefined): Date | null {
	if (!date) return null;
	return new Date(
		date.getUTCFullYear(),
		date.getUTCMonth(),
		date.getUTCDate()
	);
}

/** Lowercase, hyphen-separated and safe for a filename on any platform. */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/** e.g. "ford-mondeo-sk-208-sv", used to name a single-vehicle export. */
export function vehicleSlug(vehicle: TVehicle): string {
	return slugify(`${vehicle.make} ${vehicle.model} ${vehicle.plate}`);
}

/**
 * e.g. "service-nova-2026-09-19.csv", or
 * "service-nova-ford-mondeo-sk-208-sv-2026-09-19.xlsx" for one vehicle.
 */
export function exportFilename(
	extension: "csv" | "json" | "xlsx",
	options: { slug?: string; now?: Date } = {}
) {
	const { slug, now = new Date() } = options;
	return ["service-nova", slug, toIsoDay(now)]
		.filter(Boolean)
		.join("-")
		.concat(`.${extension}`);
}
