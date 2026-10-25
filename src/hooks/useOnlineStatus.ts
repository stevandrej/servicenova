import { useEffect, useState } from "react";

/**
 * Tracks browser connectivity so the UI can explain why a save succeeded with
 * no network. navigator.onLine only reports whether there is *a* connection,
 * which is enough to caption a write that Firestore has queued locally.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
}
