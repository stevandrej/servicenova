# Feature: vehicle-form

Add/edit form for a vehicle. See the root `CLAUDE.md` for app-wide conventions.

## Files

- `vehicle.form.tsx`: `VehicleForm({ mode, vehicle?, onSuccess? })`.

## Behaviour

- Fields: make, model, year (1900 to next year), plate (all required), and an image URL (optional).
- Inputs are uncontrolled (`useRef`). In edit mode, a `useEffect` also fills the refs from `vehicle` in addition to `defaultValue`.
- `mode === "add"` → `useAddVehicle`. `mode === "edit"` → `useUpdateVehicle`. Both toast and then `refetchQueries(["vehicles"])`.
- `onSuccess` is used both after a successful submit and for the Cancel button. It's normally the modal's `onClose`.

## Usage

- Always rendered inside a NextUI `ModalContent`. The form outputs `ModalHeader` / `ModalBody` / `ModalFooter` directly, so it won't lay out correctly outside a modal.
- The wrapper is `VehicleFormModal` in `../vehicle-details/vehicle-form-modal.tsx`, used by `/vehicles` (add) and the vehicle details page (edit).

## Gotchas

- The image is a **URL string**, not an upload. Firebase Storage is initialised in `src/config/firebase.ts` but not used yet.
- New vehicle fields need changes in four places: `TVehicle` (`src/types/vehicle.type.ts`), this form, `useAddVehicle`, and `useUpdateVehicle`. The add and update hooks each build their own explicit payload.
- New vehicles are created without `nextServiceDate`. It's set when the first service with a next date is added.
