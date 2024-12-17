import { Timestamp } from "firebase/firestore";

export function formatDateToLongDate(date: Date) {
	return date.toLocaleDateString("en-US", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export function dateToFirebaseTimestamp(date: Date): Timestamp {
	return Timestamp.fromDate(date);
}

export function firebaseTimestampToDate(timestamp: Timestamp): Date {
	return timestamp.toDate();
}
