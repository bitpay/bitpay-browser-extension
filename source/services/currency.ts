/* eslint-disable no-nested-ternary */
export function getPrecision(currencyCode: string): number {
  return currencyCode.toUpperCase() === 'JPY' ? 0 : 2;
}
function getMinimalPrecision(amount: number, currencyCode: string): number {
  return Number.isInteger(amount) ? 0 : getPrecision(currencyCode);
}

export const currencySymbols = {
  BRL: 'R$',
  CAD: 'C$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  PHP: '₱',
  USD: '$'
} as { [currency: string]: string };

export function formatCurrency(
  amount: number,
  currencyCode: string,
  opts: { customPrecision?: number | 'minimal'; hideSymbol?: boolean } = {}
): string {
  const precision =
    opts.customPrecision === 'minimal'
      ? getMinimalPrecision(amount, currencyCode)
      : typeof opts.customPrecision === 'number'
      ? opts.customPrecision
      : getPrecision(currencyCode);
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  });
  const numericValue = formatter.format(amount);
  const symbol = opts.hideSymbol ? undefined : currencySymbols[currencyCode.toUpperCase()];
  const finalValue = symbol ? `${symbol}${numericValue}` : `${numericValue} ${currencyCode}`;

  return finalValue;
}
