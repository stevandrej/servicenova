import { TVehicleWithServices } from "../types/vehicle.type";
import { formatDate } from "../utils/formatDate";
import { daysUntil, getVehiclesDue } from "../utils/serviceDue";

export const REMINDER_DISMISSED_KEY = "serviceNova:remindersDismissed";
const LAST_CHECK_KEY = "serviceNova:lastReminderCheck";

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

/** Must be called from a user gesture - browsers reject an on-load request. */
export async function requestReminderPermission() {
  if (!notificationsSupported()) return "unsupported" as const;
  return Notification.requestPermission();
}

/**
 * The service worker registration is preferred over `new Notification(...)`:
 * on Android, page-context notifications are not supported at all, and a
 * notification shown through the registration survives the tab closing.
 */
async function show(title: string, options: NotificationOptions) {
  if (!("serviceWorker" in navigator)) {
    new Notification(title, options);
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, options);
  } catch {
    new Notification(title, options);
  }
}

/** Count on the installed app icon. This is the part that outlives the tab. */
export function updateAppBadge(count: number) {
  if (!("setAppBadge" in navigator)) return;

  const nav = navigator as Navigator & {
    setAppBadge: (count?: number) => Promise<void>;
    clearAppBadge: () => Promise<void>;
  };

  const update = count > 0 ? nav.setAppBadge(count) : nav.clearAppBadge();
  update.catch(() => {
    /* badging is best-effort; a rejection is not worth surfacing */
  });
}

/**
 * Notifies once per calendar day for each vehicle whose service is due or past,
 * and always refreshes the app badge. The day guard means reopening the app
 * repeatedly does not re-notify.
 */
export async function runServiceReminders(vehicles: TVehicleWithServices[]) {
  const due = getVehiclesDue(vehicles);
  updateAppBadge(due.length);

  if (notificationPermission() !== "granted" || due.length === 0) return;

  const today = new Date().toDateString();
  if (localStorage.getItem(LAST_CHECK_KEY) === today) return;
  localStorage.setItem(LAST_CHECK_KEY, today);

  for (const vehicle of due) {
    const days = daysUntil(new Date(vehicle.nextServiceDate!));
    const when =
      days < 0
        ? `overdue since ${formatDate(new Date(vehicle.nextServiceDate!))}`
        : days === 0
        ? "due today"
        : `due in ${days} day${days === 1 ? "" : "s"}`;

    await show(`${vehicle.make} ${vehicle.model} service ${when}`, {
      body: `Plate ${vehicle.plate} — ${formatDate(
        new Date(vehicle.nextServiceDate!)
      )}`,
      icon: "/pwa-192x192.png",
      badge: "/pwa-64x64.png",
      // One notification per vehicle: reopening the app replaces it in the
      // tray rather than stacking a second copy.
      tag: `service-nova:${vehicle.id}`,
    });
  }
}
