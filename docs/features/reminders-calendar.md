# Reminders & calendar export

## Purpose

Answering "when is this car next due?" — how `nextServiceDate` gets set, how urgency is surfaced visually, and how a reminder gets into the user's own calendar. This is the app's second reason to exist, alongside the service log.

## Files

| Path | Role |
| --- | --- |
| `src/features/vehicle-details/service-form-modal.tsx` | The only place a user sets a next-service date |
| `src/services/useAddService.ts` | Writes `nextServiceDate` onto the vehicle document |
| `src/services/useFetchVehicles.ts` | Converts the stored `Timestamp` back to a `Date` |
| `src/utils/serviceDue.ts` | The single source of truth for thresholds and urgency |
| `src/features/vehicle-card/getStatusColorClasses.ts` | Urgency → card background color |
| `src/services/notifications.ts` | Due-service notifications and the app-icon badge |
| `src/hooks/useServiceReminders.ts` | Runs the reminder check off the `["vehicles"]` cache |
| `src/features/dashboard/components/reminder-permission-card.tsx` | The opt-in prompt for notification permission |
| `src/components/add-to-calendar.tsx` | Google Calendar link and `.ics` download |
| `src/features/dashboard/components/overview.tsx` | "Upcoming Services" count |
| `src/features/dashboard/components/vehicles-need-attention.tsx` | "Needs Attention" list |

## How it works

**Setting a date.** The service form's optional "Next Service Date" `DatePicker` ("When should a service be performed again?") is converted to a `Timestamp` on submit and written onto the **service record**. The vehicle keeps a denormalized copy of the newest record's value so the list and dashboard can show it without loading service subcollections — but that copy is only rewritten when the saved service is the most recent one. See [service-history.md](service-history.md#the-reminder-date) for the full rule and why it exists.

**Reading it back.** `fetchVehicles` maps `nextServiceDate` through `firebaseTimestampToDate` for each service, then derives the vehicle's value from the newest service that has one, falling back to the vehicle document's own stored field for records written before the field moved. Everything downstream works with `Date`.

**Urgency thresholds.** All of them live in `src/utils/serviceDue.ts`. `getServiceUrgency(nextServiceDate)` returns one of five values, and every consumer is derived from it:

| Urgency | Meaning |
| --- | --- |
| `none` | no next-service date set |
| `overdue` | the date has passed |
| `due-soon` | within `DUE_SOON_DAYS` (30) |
| `upcoming` | within `UPCOMING_DAYS` (90) |
| `ok` | further out than that |

`STALE_SERVICE_DAYS` (320, the "roughly ten months" heuristic) is the separate rule for a vehicle with no next-service date that simply has not been touched in a long time.

| Where | Rule |
| --- | --- |
| `getStatusColorClasses.ts` (vehicle card) | one background color per urgency. `overdue` is a deeper red than `due-soon`; they used to share one red, so a vehicle three months late looked identical to one due next week |
| `overview.tsx` ("Upcoming Services") | `getVehiclesDue` — `overdue` or `due-soon` |
| `vehicles-need-attention.tsx` | `getVehiclesNeedingAttention` — never serviced, stale beyond `STALE_SERVICE_DAYS`, `overdue`, or `due-soon`; sorted most urgent first and capped at 3 cards with a "+N more" line |
| `notifications.ts` | `getVehiclesDue` for both the notification set and the badge count |

**Notifications.** `useServiceReminders` (mounted in `MainLayout`) reads the `["vehicles"]` cache — it issues no query of its own — and calls `runServiceReminders`, which:

- always refreshes the app-icon badge via `navigator.setAppBadge` / `clearAppBadge` with the due count, feature-detected;
- if permission is granted, posts one notification per due vehicle through `navigator.serviceWorker.ready` → `registration.showNotification`, tagged `service-nova:{vehicleId}` so reopening the app replaces rather than stacks;
- guards the notifications behind a `serviceNova:lastReminderCheck` day stamp in `localStorage`, so reopening the app repeatedly does not re-notify.

Permission is opted into from `ReminderPermissionCard` at the top of the dashboard, shown only while `Notification.permission === "default"` and not dismissed (`serviceNova:remindersDismissed`). It has to be a button: browsers reject a permission request that is not tied to a user gesture.

**Calendar export.** `AddToCalendar` takes `{ date, vehicleMake, vehicleModel, vehiclePlate? }` and builds:

- title — `Service Reminder: {make} {model}`
- description — `This is an automated reminder from Service Nova to check or service your {make} {model}.`

It renders a NextUI `Dropdown` whose `DropdownMenu onAction` handles two keys:

- `google` — opens `https://calendar.google.com/calendar/render?action=TEMPLATE&…` in a new tab, with `dates={start}/{end}` as all-day `YYYYMMDD` values.
- `ics` — builds a `VCALENDAR`/`VEVENT` string with `UID`, `DTSTAMP`, `DTSTART;VALUE=DATE` / `DTEND;VALUE=DATE`, and a `VALARM` with `TRIGGER:-P1D` so the calendar actually reminds a day ahead. Lines are joined with CRLF per RFC 5545. It wraps that in a `Blob` and downloads it as `service-{plate}.ics` through a temporary `<a download>`. Covers Apple Calendar, Outlook, and anything else.

Both use an all-day event ending the following day. It is mounted in two places: on the vehicle card next to the date (inside a `stopPropagation` wrapper so it doesn't trigger navigation), and as the `action` of the "Next Service Due" metric card in `vehicle-info.tsx`.

## Data touched

- Firestore: `vehicles/{vehicleId}.nextServiceDate` (`Timestamp | null`).
- No calendar API calls and no stored calendar state — export is entirely client-side.

## Extending it

- **A mileage-based reminder** ("due at 120,000 km"): add the field to the vehicle document and mirror the `nextServiceDate` write in `useAddService`; compare against `currentMileage` from `vehicle-details.tsx`.
- **Changing what the calendar event says**: `title`/`description` in `add-to-calendar.tsx`. To add a time-of-day event, replace the `VALUE=DATE` fields with `DTSTART`/`DTEND` datetimes in UTC and adjust the Google `dates` parameter to the same format.
- **Changing what counts as due**: edit `DUE_SOON_DAYS` / `UPCOMING_DAYS` / `STALE_SERVICE_DAYS` in `src/utils/serviceDue.ts`; every consumer follows.

## Known gaps

- **One live reminder per vehicle.** Each service record now carries the date it set, but only the newest one drives the vehicle's reminder — there is still no way to track an oil change and a timing belt as two independent due dates.
- **Notifications only fire while the app is open.** There is no Firebase Cloud Messaging setup and no server to schedule sends, so nothing reaches the user while the app is closed. The app-icon badge is the only signal that outlives the tab. Real push needs `getMessaging`, a VAPID key, a `firebase-messaging-sw.js`, and a scheduled Cloud Function.
- The once-a-day notification guard is a `localStorage` day stamp, so it is per-browser and resets if site data is cleared.
- Clearing a next-service date is possible in the form, but only takes effect by saving the **newest** service — there is no way to clear a reminder from the vehicle form or the card.
