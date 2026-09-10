import { useEffect, useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './App.css'
import EstimateDocument from './EstimateDocument'
import type { EstimateData, LineItem } from './types'
import { grandTotal, lineAmount } from './types'
import { formatINR } from './numberToWords'
import { notifyPdfDownload } from './api'

const uid = () => Math.random().toString(36).slice(2, 9)
const newItem = (): LineItem => ({ id: uid(), description: '', area: '', rate: '' })

const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-')

const SIDEBAR_MIN = 320
const SIDEBAR_MAX = 760
const SIDEBAR_DEFAULT = 420
const SIDEBAR_KEY = 'gi.sidebarWidth'
const clampSidebar = (w: number) => Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, Math.round(w)))

const sampleItem = (description: string, area: string, rate: string): LineItem => ({
  id: uid(),
  description,
  area,
  rate,
})

const initialData: EstimateData = {
  clientName: 'Sishu Vihar Patia',
  clientAddress: 'Patia',
  clientMobile: '9933350120',
  date: today,
  quotationNo: 'GI/2026/0633',
  items: [
    sampleItem('PVC Ceiling', '440', '250'),
    sampleItem('PVC Running', '200', '250'),
    sampleItem('BIM Paneling', '36', '850'),
    sampleItem('TV Unit (9 x 9)', '81', '1050'),
    sampleItem('Besine Box (3 x 2)', '6', '1600'),
  ],
  specs: [
    'PVC Ceiling – Good quality material',
    'PVC Running – As per site requirement',
    'BIM Paneling – Premium finish',
    'TV Unit – As per design and discussion',
    'Besine Box – As per design and discussion',
  ],
  terms: [
    '30% advance payment is required before starting the work.',
    'Remaining payment will be made in stages as per work progress.',
    'Estimated completion time: As per site handover.',
    'All materials used will be as per the specification mentioned above.',
    'Any additional work or changes will be charged extra.',
    'Final handover will be done only after full & final payment.',
  ],
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="fld">
      <span className="fld-label">{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

export default function App() {
  const [data, setData] = useState<EstimateData>(initialData)
  const [busy, setBusy] = useState(false)
  const docRef = useRef<HTMLDivElement>(null)

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = Number(localStorage.getItem(SIDEBAR_KEY))
    return saved ? clampSidebar(saved) : SIDEBAR_DEFAULT
  })
  const draggingRef = useRef(false)

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(sidebarWidth))
  }, [sidebarWidth])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      e.preventDefault()
      setSidebarWidth(clampSidebar(e.clientX))
    }
    const stop = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', stop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', stop)
    }
  }, [])

  const startResize = () => {
    draggingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }
  const onResizeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setSidebarWidth((w) => clampSidebar(w - 16))
    else if (e.key === 'ArrowRight') setSidebarWidth((w) => clampSidebar(w + 16))
    else if (e.key === 'Home') setSidebarWidth(SIDEBAR_MIN)
    else if (e.key === 'End') setSidebarWidth(SIDEBAR_MAX)
  }

  const patch = (p: Partial<EstimateData>) => setData((d) => ({ ...d, ...p }))

  const updateItem = (id: string, p: Partial<LineItem>) =>
    patch({ items: data.items.map((it) => (it.id === id ? { ...it, ...p } : it)) })
  const addItem = () => patch({ items: [...data.items, newItem()] })
  const removeItem = (id: string) =>
    patch({ items: data.items.length > 1 ? data.items.filter((it) => it.id !== id) : data.items })

  const updateSpec = (i: number, v: string) =>
    patch({ specs: data.specs.map((s, idx) => (idx === i ? v : s)) })
  const addSpec = () => patch({ specs: [...data.specs, ''] })
  const removeSpec = (i: number) => patch({ specs: data.specs.filter((_, idx) => idx !== i) })

  const updateTerm = (i: number, v: string) =>
    patch({ terms: data.terms.map((t, idx) => (idx === i ? v : t)) })
  const addTerm = () => patch({ terms: [...data.terms, ''] })
  const removeTerm = (i: number) => patch({ terms: data.terms.filter((_, idx) => idx !== i) })

  const downloadPdf = async () => {
    const node = docRef.current
    if (!node) return
    setBusy(true)
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        windowWidth: node.scrollWidth,
      })

      // Single page, sized to fit the content — no page breaks. Width stays a
      // standard A4 width (210mm); height grows with however tall the
      // estimate is.
      const pageW = 210
      const pageH = (canvas.height * pageW) / canvas.width
      // compress + JPEG keeps the file small enough to ride along in the mail
      // request (Vercel rejects request bodies over ~4.5 MB with a 413).
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: [pageW, pageH], compress: true })
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.85), 'JPEG', 0, 0, pageW, pageH)

      const safe = (data.quotationNo || 'estimate').replace(/[^\w.-]+/g, '-')
      const fileName = `Green-Interior-${safe}.pdf`
      pdf.save(fileName)

      // Same bytes that were just downloaded, base64-encoded for the mail attachment.
      const dataUri = pdf.output('datauristring')
      const pdfBase64 = dataUri.slice(dataUri.indexOf(',') + 1)
      // Stay clear of the ~4.5 MB request cap; if it's still too big, send the
      // notification without the attachment rather than losing the mail entirely.
      const withinLimit = pdfBase64.length < 3_800_000

      // Notify backend in the background — sends a mail (with the PDF attached) via nodemailer.
      notifyPdfDownload({
        clientName: data.clientName,
        clientMobile: data.clientMobile,
        quotationNo: data.quotationNo,
        total,
        fileName,
        pdfBase64: withinLimit ? pdfBase64 : undefined,
      })
    } finally {
      setBusy(false)
    }
  }

  const total = grandTotal(data)

  return (
    <div className="app" style={{ '--sidebar-w': `${sidebarWidth}px` } as React.CSSProperties}>
      <aside className="app-form">
        <h1 className="app-h1">Estimate Builder</h1>
        <p className="app-lead">
          Enter the requirement and every rate manually. The preview matches the print layout — click
          <strong> Download PDF</strong> when done.
        </p>

        <div className="grp">
          <div className="grp-title">Client &amp; quotation</div>
          <div className="grp-body">
            <Field label="Name (To,)" value={data.clientName} onChange={(v) => patch({ clientName: v })} placeholder="Sishu Vihar Patia" />
            <Field label="Address" value={data.clientAddress} onChange={(v) => patch({ clientAddress: v })} placeholder="Patia" />
            <Field label="Mobile" value={data.clientMobile} onChange={(v) => patch({ clientMobile: v })} placeholder="9933350120" />
            <div className="row2">
              <Field label="Date" value={data.date} onChange={(v) => patch({ date: v })} placeholder="09-08-2026" />
              <Field label="Quotation No." value={data.quotationNo} onChange={(v) => patch({ quotationNo: v })} placeholder="GI/2026/0633" />
            </div>
          </div>
        </div>

        <div className="grp">
          <div className="grp-title">Work items</div>
          <div className="grp-body">
            <div className="item-row item-row-head">
              <span>Work description</span>
              <span>Area</span>
              <span>Rate ₹</span>
              <span>Amount ₹</span>
              <span />
            </div>
            {data.items.map((item, i) => (
              <div className="item-row" key={item.id}>
                <span className="item-no">{i + 1}</span>
                <input
                  value={item.description}
                  placeholder="PVC Ceiling"
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                />
                <input
                  value={item.area}
                  inputMode="decimal"
                  placeholder="440"
                  onChange={(e) => updateItem(item.id, { area: e.target.value })}
                />
                <input
                  value={item.rate}
                  inputMode="decimal"
                  placeholder="250"
                  onChange={(e) => updateItem(item.id, { rate: e.target.value })}
                />
                <span className="item-amount">₹{formatINR(lineAmount(item))}</span>
                <button
                  className="btn-x"
                  onClick={() => removeItem(item.id)}
                  title="Remove row"
                  disabled={data.items.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
            <button className="btn-add sm" onClick={addItem}>
              + Add item
            </button>
            <div className="grand-preview">
              Grand total: <strong>₹ {formatINR(total)} /-</strong>
            </div>
          </div>
        </div>

        <div className="grp">
          <div className="grp-title">Material specifications</div>
          <div className="grp-body">
            {data.specs.map((s, i) => (
              <div className="item-row term-row" key={i}>
                <input
                  className="grow"
                  value={s}
                  placeholder="PVC Ceiling – Good quality material"
                  onChange={(e) => updateSpec(i, e.target.value)}
                />
                <button className="btn-x" onClick={() => removeSpec(i)} title="Remove">
                  ✕
                </button>
              </div>
            ))}
            <button className="btn-add sm" onClick={addSpec}>
              + Add specification
            </button>
          </div>
        </div>

        <div className="grp">
          <div className="grp-title">Terms &amp; conditions</div>
          <div className="grp-body">
            {data.terms.map((t, i) => (
              <div className="item-row term-row" key={i}>
                <input className="grow" value={t} onChange={(e) => updateTerm(i, e.target.value)} />
                <button className="btn-x" onClick={() => removeTerm(i)} title="Remove">
                  ✕
                </button>
              </div>
            ))}
            <button className="btn-add sm" onClick={addTerm}>
              + Add term
            </button>
          </div>
        </div>

        <div className="app-actions">
          <button className="btn-primary" onClick={downloadPdf} disabled={busy}>
            {busy ? 'Generating…' : 'Download PDF'}
          </button>
        
        </div>
      </aside>

      <div
        className="app-resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        aria-valuemin={SIDEBAR_MIN}
        aria-valuemax={SIDEBAR_MAX}
        aria-valuenow={sidebarWidth}
        tabIndex={0}
        onMouseDown={startResize}
        onKeyDown={onResizeKey}
        onDoubleClick={() => setSidebarWidth(SIDEBAR_DEFAULT)}
        title="Drag to resize · double-click to reset"
      >
        <span className="app-resizer-grip" />
      </div>

      <main className="app-preview">
        <div className="preview-scroll">
          <EstimateDocument ref={docRef} data={data} />
        </div>
      </main>
    </div>
  )
}
