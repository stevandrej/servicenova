import { toast } from "react-toastify";

/**
 * Firestore commits a write to its local cache synchronously, but the promise
 * returned by setDoc / updateDoc / deleteDoc / batch.commit() only settles once
 * the *server* acknowledges it. Offline that acknowledgement never arrives, so
 * awaiting one hangs the mutation forever: no toast, no cache patch, and the
 * modal stuck on its spinner.
 *
 * settleLocally resolves as soon as the write is in the local cache and lets the
 * server acknowledgement - or its rejection - land later. A genuine server
 * failure (a rules violation, say) therefore surfaces as a late error toast
 * rather than through the mutation's own onError.
 */
export function settleLocally<T>(value: T, ack: Promise<unknown>): Promise<T> {
  ack.catch((error) => {
    console.error("Firestore rejected a write", error);
    toast.error("A change could not be saved to the server.");
  });
  return Promise.resolve(value);
}

/** True when the browser believes it is offline, for wording save toasts. */
export function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** Success toast wording that tells the truth about where the write landed. */
export function savedToast(onlineMessage: string) {
  toast.success(
    isOffline()
      ? `${onlineMessage} — will sync when you're back online`
      : onlineMessage
  );
}
