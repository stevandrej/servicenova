/**
 * Currency is a single hardcoded code for now - the app assumes one garage in
 * one country. Keeping it here means there is one place to change when that
 * stops being true, instead of five inline "MKD" strings across components.
 */
export const CURRENCY = "MKD";

/** e.g. "12,500 MKD". Amounts are whole units; fractions are not tracked. */
export function formatCurrency(amount: number) {
  return `${Math.round(amount).toLocaleString("en-GB")} ${CURRENCY}`;
}
