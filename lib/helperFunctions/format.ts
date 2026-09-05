// currency is free-typed in Settings, so it isn't guaranteed to be a real
// ISO 4217 code Intl recognises - fall back to a plain number if it isn't
export function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`.trim()
  }
}

// same idea but keeps cents, for tooltips where precision matters more than
// axis-label brevity
export function formatCurrencyPrecise(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(value)
  } catch {
    return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`.trim()
  }
}
