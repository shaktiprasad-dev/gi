import { forwardRef } from 'react'
import type { EstimateData } from './types'
import { COMPANY, grandTotal, lineAmount } from './types'
import { formatINR } from './numberToWords'

/* ------------------------------- icons ------------------------------- */
const IconPhone = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
    <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.6 1 1 0 01-.25 1z" />
  </svg>
)
const IconPin = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
    <path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
  </svg>
)
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    <rect x="6.5" y="12" width="3" height="3" fill="currentColor" stroke="none" />
  </svg>
)
const IconDoc = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 2.5h8l5 5V21a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z" />
    <path d="M13.5 2.5V8H19M8.5 12.5h7M8.5 16h7" />
  </svg>
)
const IconClipboard = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="4" y="4" width="16" height="18" rx="2" />
    <rect x="8" y="2" width="8" height="4" rx="1" fill="currentColor" stroke="none" />
    <path d="M8 10h2M8 14h2M8 18h2" />
    <path d="M13 10h4M13 14h4M13 18h4" strokeWidth="1.4" />
  </svg>
)
// Currently unused — the icon next to "TERMS & CONDITIONS" is commented out below.
// const IconTermsList = () => (
//   <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
//     <rect x="4" y="3" width="16" height="18" rx="2" />
//     <rect x="8.5" y="1.5" width="7" height="3.5" rx="1" fill="currentColor" stroke="none" />
//     <path d="M8 9h8M8 13h8M8 17h5" strokeLinecap="round" />
//   </svg>
// )
const IconCheck = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#2f8f3a" />
    <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconMedal = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <circle cx="12" cy="9" r="6" />
    <path d="M12 6l1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 12.4 9.5 13.6l.5-2.6-1.9-1.8 2.6-.4z" fill="currentColor" stroke="none" />
    <path d="M8.5 14.5L7 22l5-2.5L17 22l-1.5-7.5" />
  </svg>
)
const IconTeam = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <circle cx="9" cy="8" r="3" />
    <circle cx="17" cy="9.5" r="2.3" />
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M15 19c0-2.2 1-3.7 2.5-4.2" />
  </svg>
)
const IconShield = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M12 2.5l7 2.5v6c0 5-3.2 8.5-7 10.5-3.8-2-7-5.5-7-10.5V5z" />
    <path d="M8.5 12l2.5 2.5L16 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconHands = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M2 9l4-3 5 4 5-4 4 3-5 6-4-3-4 3z" />
    <path d="M11 10l2 2" />
  </svg>
)
const badgeIcons = [<IconMedal />, <IconTeam />, <IconShield />, <IconHands />]

/* ----------------------------- component ----------------------------- */
interface Props {
  data: EstimateData
}

const EstimateDocument = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const total = grandTotal(data)

  return (
    <div className="estimate-doc" ref={ref}>
      <div className="ed-inner">
        <div className="ed-content">
          {/* ---------------- header ---------------- */}
          <div className="ed-head">
            <div className="ed-brand">
              <img
                className="ed-logo-img"
                src="/logo.png"
                onError={(e) => {
                  const img = e.currentTarget
                  if (!img.src.endsWith('/logo.jpeg')) img.src = '/logo.jpeg'
                }}
                alt="Green Interior"
                crossOrigin="anonymous"
              />
              <div className="ed-tagline">
                MODULAR KITCHEN &nbsp;|&nbsp; FALSE CEILING &nbsp;|&nbsp; ALUMINIUM &amp; TILES WORKS
              </div>
            </div>

            <div className="ed-contact">
              <div className="ed-crow">
                <span className="ed-cicon"><IconPhone /></span>
                <span>
                  {COMPANY.phones[0]}
                  <br />
                  {COMPANY.phones[1]}
                </span>
              </div>
              <div className="ed-crow">
                <span className="ed-cicon"><IconPin /></span>
                <span>
                  {COMPANY.addressLine1}
                  <br />
                  {COMPANY.addressLine2}
                </span>
              </div>
              <div className="ed-crow">
                <span className="ed-cicon ed-cicon-text">GST</span>
                <span>GSTIN : {COMPANY.gstin}</span>
              </div>
            </div>
          </div>

          {/* ---------------- title ---------------- */}
          <div className="ed-title-row">
            <span className="ed-dash" />
            <div className="ed-title-badge">ESTIMATE / QUOTATION</div>
            <span className="ed-dash" />
          </div>

          {/* ---------------- client + meta ---------------- */}
          <div className="ed-to">
            <div className="ed-to-left">
              <div className="ed-to-label">To,</div>
              <div className="ed-to-name">{data.clientName}</div>
              <div className="ed-to-line">
                <span className="ed-to-k">Address</span> : {data.clientAddress}
              </div>
              <div className="ed-to-line">
                <span className="ed-to-k">Mobile</span> : {data.clientMobile}
              </div>
              <div className="ed-to-dotted" />
            </div>

            <div className="ed-datebox">
              <div className="ed-date-row">
                <span className="ed-dicon "><IconCalendar /></span>
                <span className="ed-date-k">Date</span>
                <span>:</span>
                <span className="ed-date-v">{data.date}</span>
              </div>
              <div className="ed-date-row">
                <span className="ed-dicon"><IconDoc /></span>
                <span className="ed-date-k">Quotation No.</span>
                <span>:</span>
                <span className="ed-date-v">{data.quotationNo}</span>
              </div>
            </div>
          </div>

          {/* ---------------- table ---------------- */}
          <div className="ed-table-wrap">
            <table className="ed-table">
              <thead>
                <tr>
                  <th style={{ width: '11%' }}>SL. NO.</th>
                  <th style={{ width: '37%' }}>WORK DESCRIPTION</th>
                  <th style={{ width: '19%' }}>AREA (SQ.FT.)</th>
                  <th style={{ width: '15%' }}>RATE (₹)</th>
                  <th style={{ width: '18%' }}>AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, i) => (
                  <tr key={item.id}>
                    <td className="c">{i + 1}</td>
                    <td>{item.description}</td>
                    <td className="c">{item.area ? `${item.area} Sq.ft.` : ''}</td>
                    <td className="c">{item.rate ? `₹${formatINR(parseFloat(item.rate))}` : ''}</td>
                    <td className="c ed-amount">₹{formatINR(lineAmount(item))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---------------- grand total ---------------- */}
          <div className="ed-grand">
            <div className="ed-grand-l">GRAND TOTAL</div>
            <div className="ed-grand-r">₹ {formatINR(total)} /-</div>
          </div>

          {/* ---------------- material specs ---------------- */}
          <div className="ed-sec-title">
            <span className="ed-sec-dash" />
            <div className="ed-sec-badge">MATERIAL SPECIFICATIONS</div>
            <span className="ed-sec-dash" />
          </div>
          <div className="ed-spec-box">
            <div className="ed-spec-icon"><IconClipboard size={40} /></div>
            <ul className="ed-spec-list">
              {data.specs.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {/* ---------------- terms ---------------- */}
          <div className="ed-terms">
            <div className="ed-terms-legend">
              {/* <IconTermsList /> */}
              <span>TERMS &amp; CONDITIONS</span>
            </div>
            <ul className="ed-terms-list">
              {data.terms.map((t, i) => (
                <li key={i}>
                  <span className="ed-chk"><IconCheck /></span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------------- thanks ---------------- */}
          <div className="ed-thanks">
            <span className="ed-thanks-dash" />
            <span className="ed-thanks-script">Thank You!</span>
            <span className="ed-thanks-dash" />
          </div>
          <div className="ed-thanks-sub">{COMPANY.thanksSub}</div>
        </div>

        {/* ---------------- footer bar ---------------- */}
        <div className="ed-footbar">
          {COMPANY.badges.map((b, i) => (
            <div className="ed-foot-item" key={b}>
              <span className="ed-foot-ic">{badgeIcons[i]}</span>
              <span className="ed-foot-txt">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

EstimateDocument.displayName = 'EstimateDocument'
export default EstimateDocument
