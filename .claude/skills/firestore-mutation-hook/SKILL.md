---
name: firestore-mutation-hook
description: Add or change a Firestore write in Service Nova — creating, updating or deleting a vehicle or a service record. Use when the task adds a new mutation hook in src/services/, edits an existing one, or wires a form or button to a Firestore write. Covers the offline-safe write pattern (settleLocally, no await, client-minted ids) and the ["vehicles"] cache update that every write has to make.
---

# Adding a Firestore mutation hook

Every write in this app goes through one hook file in `src/services/`. The
pattern is not obvious and getting it wrong fails silently *only when offline*,
which is the one state nobody tests by hand. Follow the checklist.

## Checklist

1. **One file per mutation**, named `use<Verb><Noun>.ts` in `src/services/`
   (`useAddVehicle.ts`, `useDeleteService.ts`). It exports exactly one hook.
2. **Never `await` the Firestore write.** Pass it to `settleLocally(value, ack)`
   from `src/services/settleLocally.ts`. See "Why" below.
3. **Creating a document?** Mint the id client-side with
   `doc(collection(db, path))`, then `setDoc(ref, data)`. Never `addDoc`.
4. **Success toast is `savedToast(message)`**, not `toast.success(...)`.
   `savedToast` appends "will sync when you're back online" when offline.
5. **Update the `["vehicles"]` cache.** Either `queryClient.setQueryData` to
   patch it locally (preferred — works offline) or `refetchQueries`. A write
   that doesn't touch the cache leaves the dashboard, the list and the detail
   page showing stale data.
6. **Add an `onError`** with a `toast.error` fallback message.
7. **Relative imports.** The `@/` alias exists but nothing uses it.

## Why the write is never awaited

Firestore commits to its local cache synchronously, but the promise from
`setDoc` / `updateDoc` / `deleteDoc` only settles on the **server** ack. Offline
that ack never arrives, so `await` hangs the mutation forever: no toast, no
cache patch, and the modal stuck on its spinner. `settleLocally` resolves as
soon as the write is in the local cache and lets a later server rejection
surface as its own error toast.

The consequence to remember: a genuine server failure (a rules violation, say)
does **not** reach the mutation's `onError`. Don't write code that assumes it
does.

## Template

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, collection, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { TVehicleWithServices } from "../types/vehicle.type";
import { savedToast, settleLocally } from "./settleLocally";
import { toast } from "react-toastify";

export function useAddThing() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: AddThingData) => {
			// Client-minted id: addDoc only resolves on the server ack.
			const ref = doc(collection(db, "vehicles"));
			return settleLocally({ id: ref.id, ...data }, setDoc(ref, data));
		},
		onSuccess: (thing) => {
			savedToast("Thing added successfully");
			queryClient.setQueryData<TVehicleWithServices[]>(
				["vehicles"],
				(old) => (old ? patch(old, thing) : old)
			);
		},
		onError: () => {
			toast.error("Failed to add thing. Please try again.");
		},
	});
}
```

## Closest existing examples

| Doing | Read |
| --- | --- |
| Create with a new document id | `src/services/useAddVehicle.ts` |
| Delete, with a `setQueryData` patch | `src/services/useDeleteService.ts` |
| Update a subcollection document | `src/services/useUpdateService.ts` |
| The read side these writes invalidate | `src/services/useFetchVehicles.ts` |

## Two traps specific to services

- **Deleting or editing the newest service** has to recompute the vehicle's
  denormalized `nextServiceDate`. `useDeleteService` does this; see
  `src/services/isNewestService.ts`.
- **Service reads must stay per-vehicle.** The deployed Firestore rules have no
  `/{path=**}/services/{serviceId}` match, so a `collectionGroup` query fails
  closed. Read the subcollection per vehicle.

## Verify

```bash
pnpm typecheck && pnpm lint
```

Then exercise it at runtime — neither command catches the offline failure this
pattern exists to prevent:

1. `pnpm dev`, open the app, perform the write. Browser console errors are
   forwarded to the dev terminal by `vite/browser-to-terminal.ts`.
2. In DevTools → Network, switch to **Offline** and repeat the write. The toast
   must appear with the "will sync when you're back online" suffix, the UI must
   update, and the modal must close. If it hangs, something is being awaited.
