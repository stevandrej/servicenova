import { Timestamp } from "firebase/firestore";

export function formatDateToLongDate(date: Date) {
	return date.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export function formatDate(date: Date) {
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).replace(/\//g, "-");
}

export function dateToFirebaseTimestamp(date: Date): Timestamp {
	return Timestamp.fromDate(date);
}

export function firebaseTimestampToDate(timestamp: Timestamp): Date {
	return timestamp.toDate();
}
