// Storefront curation: Lumora deliberately offers a focused set of four products — one of which is
// a subscription (a consumable bought on a recurring schedule, wired to the ctpro Recurring Orders
// API). Keeping the curated SKUs + subscription config here makes the offer explicit.

/** The exactly-four SKUs the storefront offers (uppercase, matching the seeded ctpro catalog). */
export const STOREFRONT_SKUS = ['LUMORA-ONE', 'LUMORA-RING', 'DEEP-SLEEP', 'DAILY-RESET'];

/**
 * The subscription product: a consumable offered as "Subscribe & Save" on a recurring schedule.
 * `policyKey` references the seeded ctpro RecurrencePolicy that defines the cadence.
 */
export const SUBSCRIPTION = {
  sku: 'DAILY-RESET',
  policyKey: 'every-30-days',
  cadenceLabel: 'every 30 days',
};

/** True when a SKU is the storefront's subscription product. */
export function isSubscriptionSku(sku?: string | null): boolean {
  return !!sku && sku.toUpperCase() === SUBSCRIPTION.sku;
}
