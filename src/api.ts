import axios from 'axios'

export interface PdfDownloadPayload {
  clientName: string
  clientMobile?: string
  clientEmail?: string
  quotationNo: string
  total: number
  /** File name to use for the mail attachment, e.g. "Green-Interior-Q123.pdf". */
  fileName?: string
  /** The generated PDF, base64-encoded (no data-URI prefix), attached to the mail. */
  pdfBase64?: string
}

/**
 * Fire-and-forget notification that a PDF was downloaded. The Vite server's
 * /api/send-pdf-email middleware sends the actual mail over SMTP (nodemailer).
 * The download is never blocked on this; a failed request is only logged.
 */
export function notifyPdfDownload(payload: PdfDownloadPayload): void {
  axios.post('/api/send-pdf-email', payload, { timeout: 30000 }).catch((error) => {
    console.error('PDF download email notification failed:', error)
  })
}
