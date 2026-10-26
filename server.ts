import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  buildSheetRowValues,
  buildZohoEmailContent,
  extractSpreadsheetId,
  WorkspaceInquiryPayload,
} from './src/utils/workspaceApi';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function dispatchSheetAndZoho(inquiry: WorkspaceInquiryPayload) {
  const recipientEmail = process.env.ZOHO_RECIPIENT_EMAIL || 'us620009@gmail.com';
  const emailContent = buildZohoEmailContent(recipientEmail, inquiry);
  const rowValues = buildSheetRowValues(inquiry);

  // 1. Server-Side Google Sheets Logging via .env
  const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const sheetId = extractSpreadsheetId(process.env.GOOGLE_SHEET_ID);
  const sheetsToken = process.env.GOOGLE_SHEETS_ACCESS_TOKEN;

  if (sheetsWebhookUrl) {
    try {
      await fetch(sheetsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          row: rowValues,
          inquiry,
        }),
      });
    } catch (err) {
      console.error('Google Sheets webhook error:', err);
    }
  } else if (sheetId && sheetsToken) {
    try {
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
          sheetId
        )}?fields=sheets.properties.title`,
        {
          headers: { Authorization: `Bearer ${sheetsToken}` },
        }
      );
      let tabName = 'Sheet1';
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        tabName = metaData?.sheets?.[0]?.properties?.title || 'Sheet1';
      }

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
          sheetId
        )}/values/${encodeURIComponent(tabName)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sheetsToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            majorDimension: 'ROWS',
            values: [rowValues],
          }),
        }
      );
    } catch (err) {
      console.error('Google Sheets API error:', err);
    }
  }

  // 2. Server-Side Zoho Mail Notification via .env
  const smtpHost = process.env.ZOHO_MAIL_HOST || 'smtp.zoho.com';
  const smtpPort = Number(process.env.ZOHO_MAIL_PORT) || 465;
  const smtpUser = process.env.ZOHO_MAIL_USER;
  const smtpPass = process.env.ZOHO_MAIL_PASSWORD;
  const zohoWebhookUrl = process.env.ZOHO_WEBHOOK_URL;

  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"Trever Project Inquiries" <${smtpUser}>`,
      to: emailContent.recipientEmail,
      replyTo: emailContent.replyTo || smtpUser,
      subject: emailContent.subject,
      text: emailContent.textBody,
      html: emailContent.htmlBody,
    });
  } else if (zohoWebhookUrl) {
    await fetch(zohoWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: emailContent.recipientEmail,
        replyTo: emailContent.replyTo,
        subject: emailContent.subject,
        textBody: emailContent.textBody,
        inquiry,
      }),
    });
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '256kb' }));

  // POST /api/inquiries/submit — Server-side handler saving to Sheet & sending Zoho Mail via .env
  app.post('/api/inquiries/submit', async (req, res) => {
    try {
      const inquiry = req.body as WorkspaceInquiryPayload;
      if (!inquiry || !inquiry.fullName || !inquiry.email || !inquiry.projectDescription) {
        res.status(400).json({ error: 'Invalid inquiry payload.' });
        return;
      }

      await dispatchSheetAndZoho(inquiry);

      res.json({
        ok: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Inquiry submission error:', error);
      res.status(500).json({
        error: 'Failed to process inquiry submission.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Trever server listening on http://localhost:${PORT}`);
  });
}

startServer();
