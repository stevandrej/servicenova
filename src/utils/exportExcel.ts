import type { Column } from "write-excel-file/browser";
import { TVehicleWithServices } from "../types/vehicle.type";
import {
	ServiceRow,
	buildServiceRows,
	exportFilename,
	toSpreadsheetDate,
} from "./exportVehicles";
import { CURRENCY } from "./formatCurrency";

// Day-first, to match the en-GB formatting everywhere else in the app.
const DATE_FORMAT = "dd/mm/yyyy";
const WHOLE_NUMBER_FORMAT = "#,##0";

const dateCell = (date: Date | null) => ({
	type: Date,
	value: toSpreadsheetDate(date) ?? undefined,
	format: DATE_FORMAT,
});

const numberCell = (value: number | null) => ({
	type: Number,
	value: value ?? undefined,
	format: WHOLE_NUMBER_FORMAT,
});

// Dates and numbers are written as real typed cells rather than text, so the
// sheet can sort, total and chart them without anyone retyping a column.
export const COLUMNS: Column<ServiceRow>[] = [
	{ header: "Make", width: 14, cell: (row) => row.make },
	{ header: "Model", width: 14, cell: (row) => row.model },
	{ header: "Year", width: 8, cell: (row) => row.year },
	{ header: "Plate", width: 14, cell: (row) => row.plate },
	{
		header: "Service Date",
		width: 14,
		cell: (row) => dateCell(row.serviceDate),
	},
	{ header: "Service Type", width: 22, cell: (row) => row.serviceType },
	{
		header: "Mileage (km)",
		width: 14,
		cell: (row) => numberCell(row.mileage),
	},
	{
		header: `Price (${CURRENCY})`,
		width: 14,
		cell: (row) => numberCell(row.price),
	},
	{
		header: "Next Service Date",
		width: 18,
		cell: (row) => dateCell(row.nextServiceDate),
	},
	{ header: "Notes", width: 40, cell: (row) => row.notes },
];

/**
 * Writes an .xlsx and hands it to the browser. The writer is imported on demand
 * so it stays out of the main bundle - nobody pays for it until they export.
 */
export async function downloadXlsx(
	vehicles: TVehicleWithServices[],
	options: { slug?: string } = {}
) {
	const { default: writeXlsxFile } = await import("write-excel-file/browser");

	await writeXlsxFile(buildServiceRows(vehicles), {
		columns: COLUMNS,
	}).toFile(exportFilename("xlsx", options));
}
