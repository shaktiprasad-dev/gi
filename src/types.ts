export interface LineItem {
  id: string
  description: string
  area: string
  rate: string
}

export interface EstimateData {
  clientName: string
  clientAddress: string
  clientMobile: string
  date: string
  quotationNo: string
  items: LineItem[]
  specs: string[]
  terms: string[]
}

/** Fixed company branding — not user-editable. */
export const COMPANY = {
  phones: ['7485948039', '9348875139'],
  addressLine1: 'NABINABAG SQUARE, NABINABAG,',
  addressLine2: 'Khordha, Odisha 752055',
  gstin: '21DPXPR3724D1ZQ',
  thanksSub: 'For Choosing Green Interior',
  badges: ['QUALITY MATERIALS', 'EXPERT TEAM', 'ON TIME DELIVERY', 'CUSTOMER SATISFACTION'],
} as const

export const lineAmount = (item: LineItem): number => {
  const area = parseFloat(item.area)
  const rate = parseFloat(item.rate) || 0
  return (Number.isFinite(area) && area !== 0 ? area : 1) * rate
}

export const grandTotal = (data: EstimateData): number =>
  data.items.reduce((sum, item) => sum + lineAmount(item), 0)
