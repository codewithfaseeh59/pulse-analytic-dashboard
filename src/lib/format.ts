import { parseIsoDate } from './dates';

const LOCALE = 'en-US';

const currencyFormatters = new Map<number, Intl.NumberFormat>();

function currencyFormatter(fractionDigits: number): Intl.NumberFormat {
  let formatter = currencyFormatters.get(fractionDigits);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    currencyFormatters.set(fractionDigits, formatter);
  }
  return formatter;
}

const numberFormatter = new Intl.NumberFormat(LOCALE);

const dateFormatters = {
  short: new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric', timeZone: 'UTC' }),
  long: new Intl.DateTimeFormat(LOCALE, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }),
};

export function formatCurrency(value: number, fractionDigits = 2): string {
  return currencyFormatter(fractionDigits).format(value);
}

/** Short money for axis ticks and tight spaces: 950 -> $950, 12400 -> $12.4k, 1.2M -> $1.2M. */
export function formatCompactCurrency(value: number): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const trim = (n: number) => n.toFixed(1).replace(/\.0$/, '');
  if (abs >= 1_000_000) {
    return `${sign}$${trim(abs / 1_000_000)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${trim(abs / 1_000)}k`;
  }
  return `${sign}$${trim(abs)}`;
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Takes a ratio (0.123), not a percentage (12.3). */
export function formatPercent(ratio: number, fractionDigits = 1): string {
  return `${(ratio * 100).toFixed(fractionDigits)}%`;
}

/** Like formatPercent but always signed, for change indicators: +5.2%, -4.1%. */
export function formatDelta(ratio: number): string {
  return `${ratio > 0 ? '+' : ''}${formatPercent(ratio)}`;
}

export function formatDate(iso: string, style: 'short' | 'long' = 'short'): string {
  return dateFormatters[style].format(parseIsoDate(iso));
}
