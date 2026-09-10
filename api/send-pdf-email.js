import nodemailer from 'nodemailer'

/**
 * Vercel Serverless Function: POST /api/send-pdf-email
 *
 * Production equivalent of the pdf-mail middleware in vite.config.ts (which only
 * runs under `vite dev` / `vite preview`). Sends an SMTP notification whenever
 * the front end reports that an estimate PDF was downloaded.
 *
 * Required env vars (Vercel > Project > Settings > Environment Variables):
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO
 */
export default async function handler(req, res) {
  // Health check: open the URL in a browser to confirm the function is deployed.
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, route: 'send-pdf-email' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const env = process.env
  const body =
    typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}

  const { clientName, clientMobile, clientEmail, quotationNo, total } = body

  if (!clientName || !quotationNo) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 465,
      secure: env.SMTP_SECURE !== 'false',
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })

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
        <p>Automated notification sent when an estimate PDF is downloaded.</p>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[send-pdf-email] send failed:', err)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
