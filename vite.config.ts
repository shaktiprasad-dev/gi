import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import nodemailer from 'nodemailer'

/**
 * Adds a POST /api/send-pdf-email route to Vite's own dev/preview server
 * (no separate backend process). It sends a mail over SMTP with nodemailer
 * whenever the front end reports a PDF download.
 */
function pdfMailPlugin(env: Record<string, string>): Plugin {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 465,
    secure: env.SMTP_SECURE !== 'false',
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  })

  const readJson = (req: IncomingMessage) =>
    new Promise<Record<string, unknown>>((resolve, reject) => {
      let raw = ''
      req.on('data', (c) => {
        raw += c
        if (raw.length > 8e6) req.destroy()
      })
      req.on('end', () => {
        try {
          resolve(raw ? JSON.parse(raw) : {})
        } catch (err) {
          reject(err)
        }
      })
      req.on('error', reject)
    })

  const handler: Connect.NextHandleFunction = async (req, res, next) => {
    const url = req.url?.split('?')[0]
    if (req.method !== 'POST' || url !== '/api/send-pdf-email') return next()

    const send = (code: number, body: unknown) => {
      res.statusCode = code
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(body))
    }

    try {
      const { clientName, clientMobile, clientEmail, quotationNo, total, fileName, pdfBase64 } =
        await readJson(req)

      if (!clientName || !quotationNo) {
        return send(400, { error: 'Missing required fields' })
      }

      const attachments =
        typeof pdfBase64 === 'string' && pdfBase64
          ? [
              {
                filename: (fileName as string) || `Quotation-${quotationNo}.pdf`,
                content: Buffer.from(pdfBase64, 'base64'),
                contentType: 'application/pdf',
              },
            ]
          : []

      await transporter.sendMail({
        from: env.MAIL_FROM || env.SMTP_USER,
        to: env.MAIL_TO,
        subject: `PDF Downloaded - Quotation ${quotationNo}`,
        html: `
          <h2>Estimate PDF Downloaded</h2>
          <p><strong>Client Name:</strong> ${clientName}</p>
          <p><strong>Quotation No:</strong> ${quotationNo}</p>
          <p><strong>Total Amount:</strong> &#8377;${total ?? ''}</p>
          ${clientMobile ? `<p><strong>Client Mobile:</strong> ${clientMobile}</p>` : ''}
          ${clientEmail ? `<p><strong>Client Email:</strong> ${clientEmail}</p>` : ''}
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p>Automated notification sent when an estimate PDF is downloaded.${
            attachments.length ? ' The estimate PDF is attached.' : ''
          }</p>
        `,
        attachments,
      })

      send(200, { success: true })
    } catch (err) {
      console.error('[pdf-mail] send failed:', err)
      const done = res as ServerResponse
      if (!done.headersSent) send(500, { error: 'Failed to send email' })
    }
  }

  return {
    name: 'pdf-mail-endpoint',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), pdfMailPlugin(env)],
  }
})
