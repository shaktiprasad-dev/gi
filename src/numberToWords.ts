const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
]
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(n: number): string {
  if (n < 20) return ones[n]
  const t = Math.floor(n / 10)
  const o = n % 10
  return tens[t] + (o ? ' ' + ones[o] : '')
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100)
  const r = n % 100
  let s = ''
  if (h) s += ones[h] + ' Hundred'
  if (r) s += (s ? ' ' : '') + twoDigits(r)
  return s
}

/** Converts a number to words using the Indian numbering system (Lakh, Crore). */
export function numberToWordsIndian(value: number): string {
  let num = Math.round(value)
  if (!Number.isFinite(num) || num === 0) return 'Zero'
  if (num < 0) return 'Minus ' + numberToWordsIndian(-num)

  const crore = Math.floor(num / 10000000)
  num %= 10000000
  const lakh = Math.floor(num / 100000)
  num %= 100000
  const thousand = Math.floor(num / 1000)
  num %= 1000
  const rest = num

  const parts: string[] = []
  if (crore) parts.push((crore > 999 ? numberToWordsIndian(crore) : threeDigits(crore)) + ' Crore')
  if (lakh) parts.push(twoDigits(lakh) + ' Lakh')
  if (thousand) parts.push(twoDigits(thousand) + ' Thousand')
  if (rest) parts.push(threeDigits(rest))
  return parts.join(' ')
}

export const formatINR = (n: number): string =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n || 0))
