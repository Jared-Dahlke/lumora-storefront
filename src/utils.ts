export function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** Deterministic on-brand gradient derived from a string, for image fallbacks. */
export function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = 150 + (hash % 50); // teal/green family
  const hue2 = 165 + (hash % 35);
  return `linear-gradient(135deg, hsl(${hue} 45% 88%), hsl(${hue2} 38% 72%))`;
}
