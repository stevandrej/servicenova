import { Timestamp } from "firebase/firestore";

// Dates are stored as UTC-midnight day values, so they are formatted in UTC
// too - otherwise a viewer west of UTC sees every date a day early.
export function formatDateToLongDate(date: Date) {
	return date.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	});
}

/** "20 Nov" - the compact form used by the service history rows. */
export function formatDayMonth(date: Date) {
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		timeZone: "UTC",
	});
}

export function formatDate(date: Date) {
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "UTC",
	}).replace(/\//g, "-");
}

export function dateToFirebaseTimestamp(date: Date): Timestamp {
	return Timestamp.fromDate(date);
}

export function firebaseTimestampToDate(timestamp: Timestamp): Date {
	return timestamp.toDate();
}
