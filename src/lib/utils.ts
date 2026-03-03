export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format amount digits with comma separators for display in inputs (e.g. 18000 -> "18,000") */
export function formatAmountDisplay(digits: string): string {
  const raw = digits.replace(/\D/g, '');
  if (!raw || raw === '0') return raw || '0';
  const num = parseInt(raw, 10);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
}

/** Parse formatted amount string to number (e.g. "18,000" -> 18000) */
export function parseAmountInput(value: string): number {
  const raw = value.replace(/\D/g, '');
  const num = parseInt(raw, 10);
  return isNaN(num) ? 0 : num;
}
