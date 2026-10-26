import { sanitizeInput, escapeHtml } from './security';

export interface WorkspaceInquiryPayload {
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
  projectDescription: string;
  selectedServices: string[];
  complexity: string;
  platforms: string[];
  estimatedWeeksMin: number;
  estimatedWeeksMax: number;
  estimatedCostRange: string;
  recommendedTeamSummary: string;
  submittedAtIso?: string;
}

export interface SheetSyncResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetTitle: string;
  tabName: string;
  updatedRange?: string;
}

export interface ZohoMailContent {
  recipientEmail: string;
  replyTo: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  mailtoUrl: string;
}

export interface ZohoMailSyncResult {
  messageId: string;
  recipientEmail: string;
  subject: string;
  mode: 'zoho_smtp' | 'zoho_webhook' | 'zoho_outbox_queued';
  smtpHost?: string;
  timestamp: string;
  textPreview: string;
  mailtoUrl: string;
}

export const INQUIRY_SHEET_HEADERS = [
  'Timestamp (ISO)',
  'Full Name',
  'Work Email',
  'Company / Organization',
  'Telephone',
  'Selected Services',
  'Complexity Tier',
  'Target Platforms',
  'Est. Delivery Window',
  'Est. Budget Range',
  'Recommended Pod',
  'Project Brief & Goals',
];

/**
 * Neutralizes Spreadsheet Formula Injection (CSV/Sheet Injection) by prefixing
 * leading formula triggers (=, +, -, @, \t, \r) with a single quote.
 */
export function sanitizeSheetCell(value: unknown, maxLength = 2000): string {
  const clean = sanitizeInput(value, maxLength);
  if (!clean) return '';
  if (/^[=+\-@\t\r]/.test(clean)) {
    return `'${clean}`;
  }
  return clean;
}

/**
 * Extracts a clean Google Spreadsheet ID from either a full Google Sheets URL or a raw ID string.
 * Returns null if the input is empty or invalid.
 */
export function extractSpreadsheetId(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match /spreadsheets/d/{ID} pattern
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]{15,80})/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // Match raw spreadsheet ID
  if (/^[a-zA-Z0-9-_]{15,80}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Builds a deterministic 12-column row array for Google Sheets from an inquiry payload.
 */
export function buildSheetRowValues(payload: WorkspaceInquiryPayload): string[] {
  const timestamp = payload.submittedAtIso || new Date().toISOString();
  return [
    sanitizeSheetCell(timestamp, 40),
    sanitizeSheetCell(payload.fullName, 100),
    sanitizeSheetCell(payload.email, 254),
    sanitizeSheetCell(payload.companyName || 'N/A', 120),
    sanitizeSheetCell(payload.phone || 'N/A', 40),
    sanitizeSheetCell(payload.selectedServices.join(', '), 500),
    sanitizeSheetCell(payload.complexity, 40),
    sanitizeSheetCell(payload.platforms.join(', '), 200),
    sanitizeSheetCell(`${payload.estimatedWeeksMin}-${payload.estimatedWeeksMax} Weeks`, 50),
    sanitizeSheetCell(payload.estimatedCostRange, 60),
    sanitizeSheetCell(payload.recommendedTeamSummary, 300),
    sanitizeSheetCell(payload.projectDescription, 5000),
  ];
}

/**
 * Constructs structured Zoho Mail notification content (plain-text, HTML, and mailto fallback).
 */
export function buildZohoEmailContent(
  recipientEmail: string,
  payload: WorkspaceInquiryPayload
): ZohoMailContent {
  const cleanRecipient = recipientEmail.replace(/[\r\n<>]/g, '').trim();
  const cleanName = sanitizeInput(payload.fullName, 100).replace(/[\r\n]/g, ' ');
  const cleanCustomerEmail = sanitizeInput(payload.email, 254).replace(/[\r\n]/g, '');
  const cleanCompany = sanitizeInput(payload.companyName || 'Not provided', 120);
  const cleanPhone = sanitizeInput(payload.phone || 'Not provided', 30);
  const cleanBrief = sanitizeInput(payload.projectDescription, 5000);
  const timestamp = payload.submittedAtIso || new Date().toISOString();

  const subject = `[Trever Project Inquiry] ${cleanName} (${payload.companyName ? sanitizeInput(payload.companyName, 80) : cleanCustomerEmail})`;

  const textBody = [
    '================================================================',
    'TREVER — NEW CUSTOMER PROJECT INQUIRY (ZOHO MAIL NOTIFICATION)',
    '================================================================',
    '',
    `Submitted At:       ${timestamp}`,
    `Customer Name:      ${cleanName}`,
    `Work Email:         ${cleanCustomerEmail}`,
    `Company / Org:      ${cleanCompany}`,
    `Telephone:          ${cleanPhone}`,
    '',
    '----------------------------------------------------------------',
    'CONFIGURED PROJECT SCOPE & ENGINEERING ESTIMATE',
    '----------------------------------------------------------------',
    `Selected Services:  ${payload.selectedServices.join(', ')}`,
    `Scale & Complexity: ${payload.complexity.toUpperCase()}`,
    `Target Platforms:   ${payload.platforms.join(', ')}`,
    `Estimated Window:   ${payload.estimatedWeeksMin} to ${payload.estimatedWeeksMax} Weeks`,
    `Estimated Budget:   ${payload.estimatedCostRange}`,
    `Recommended Pod:    ${payload.recommendedTeamSummary}`,
    '',
    '----------------------------------------------------------------',
    'PROJECT BRIEF & TECHNICAL GOALS',
    '----------------------------------------------------------------',
    cleanBrief,
    '',
    '================================================================',
    'Dispatched via Trever Zoho Mail Notification Service.',
  ].join('\r\n');

  const htmlBody = `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; background-color: #070b0e; color: #f1f5f9; padding: 32px; border-radius: 16px; max-width: 640px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px;">
        <span style="font-family: monospace; font-size: 11px; color: #34d399; text-transform: uppercase; letter-spacing: 1.5px;">TREVER · ZOHO MAIL INQUIRY ALERT</span>
        <h2 style="margin: 8px 0 0; font-size: 22px; color: #ffffff;">New Project Scope &amp; Inquiry</h2>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px 0; color: #94a3b8; width: 150px;">Customer Name</td>
          <td style="padding: 8px 0; color: #ffffff; font-weight: 600;">${escapeHtml(cleanName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">Work Email</td>
          <td style="padding: 8px 0; color: #34d399; font-family: monospace;">${escapeHtml(cleanCustomerEmail)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">Company / Org</td>
          <td style="padding: 8px 0; color: #e2e8f0;">${escapeHtml(cleanCompany)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">Telephone</td>
          <td style="padding: 8px 0; color: #e2e8f0;">${escapeHtml(cleanPhone)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">Submitted At</td>
          <td style="padding: 8px 0; color: #94a3b8; font-family: monospace;">${escapeHtml(timestamp)}</td>
        </tr>
      </table>
      <div style="background-color: #0c1318; border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-family: monospace; font-size: 11px; color: #34d399; text-transform: uppercase; margin-bottom: 10px;">Configured Scope &amp; Engineering Estimate</div>
        <div style="font-size: 13px; color: #e2e8f0; line-height: 1.6;">
          <div><strong>Services:</strong> ${escapeHtml(payload.selectedServices.join(', '))}</div>
          <div><strong>Complexity:</strong> ${escapeHtml(payload.complexity.toUpperCase())}</div>
          <div><strong>Platforms:</strong> ${escapeHtml(payload.platforms.join(', '))}</div>
          <div><strong>Estimated Timeline:</strong> ${payload.estimatedWeeksMin} to ${payload.estimatedWeeksMax} Weeks</div>
          <div><strong>Estimated Budget:</strong> ${escapeHtml(payload.estimatedCostRange)}</div>
          <div><strong>Recommended Pod:</strong> ${escapeHtml(payload.recommendedTeamSummary)}</div>
        </div>
      </div>
      <div style="background-color: #0c1318; border: 1px solid #1e293b; border-radius: 12px; padding: 16px;">
        <div style="font-family: monospace; font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px;">Project Brief &amp; Technical Goals</div>
        <p style="margin: 0; font-size: 13px; color: #f1f5f9; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(cleanBrief)}</p>
      </div>
    </div>
  `.trim();

  const mailtoUrl = `mailto:${encodeURIComponent(cleanRecipient)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(textBody)}`;

  return {
    recipientEmail: cleanRecipient,
    replyTo: cleanCustomerEmail,
    subject,
    textBody,
    htmlBody,
    mailtoUrl,
  };
}

/**
 * Fetches spreadsheet metadata to identify the spreadsheet title and the actual name
 * of the first sheet tab (never hardcoding "Sheet1").
 */
export async function getSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<{ spreadsheetTitle: string; firstTabName: string }> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}?fields=properties.title,sheets.properties.title`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Failed to read Google Sheet metadata (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  const spreadsheetTitle = data?.properties?.title || 'Trever Inquiries';
  const firstTabName = data?.sheets?.[0]?.properties?.title;

  if (!firstTabName) {
    throw new Error('No valid worksheet tabs found in the specified Google Spreadsheet.');
  }

  return { spreadsheetTitle, firstTabName };
}

/**
 * Creates a brand new Google Spreadsheet pre-populated with the Trever Inquiry header row.
 */
export async function createInquirySpreadsheet(
  accessToken: string,
  title = 'Trever — Customer Project Inquiries'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; sheetTitle: string; tabName: string }> {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Inquiries',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errBody = await createRes.text();
    throw new Error(`Failed to create Google Sheet (${createRes.status}): ${errBody}`);
  }

  const created = await createRes.json();
  const spreadsheetId: string = created.spreadsheetId;
  const spreadsheetUrl: string =
    created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  const tabName: string = created.sheets?.[0]?.properties?.title || 'Inquiries';

  // Populate the header row into row 1
  const headerRange = `${tabName}!A1:L1`;
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(headerRange)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: headerRange,
        majorDimension: 'ROWS',
        values: [INQUIRY_SHEET_HEADERS],
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
    sheetTitle: title,
    tabName,
  };
}

/**
 * Appends a customer inquiry row to the specified Google Spreadsheet (or creates one if none is provided).
 */
export async function appendInquiryToSheet(
  accessToken: string,
  spreadsheetIdOrEmpty: string | null | undefined,
  payload: WorkspaceInquiryPayload
): Promise<SheetSyncResult> {
  let targetSpreadsheetId = extractSpreadsheetId(spreadsheetIdOrEmpty);
  let sheetTitle = 'Trever — Customer Project Inquiries';
  let tabName = 'Inquiries';

  if (!targetSpreadsheetId) {
    const created = await createInquirySpreadsheet(accessToken, sheetTitle);
    targetSpreadsheetId = created.spreadsheetId;
    sheetTitle = created.sheetTitle;
    tabName = created.tabName;
  } else {
    const meta = await getSpreadsheetMetadata(accessToken, targetSpreadsheetId);
    sheetTitle = meta.spreadsheetTitle;
    tabName = meta.firstTabName;
  }

  const rowValues = buildSheetRowValues(payload);
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    targetSpreadsheetId
  )}/values/${encodeURIComponent(tabName)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const appendRes = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      majorDimension: 'ROWS',
      values: [rowValues],
    }),
  });

  if (!appendRes.ok) {
    const errBody = await appendRes.text();
    throw new Error(`Failed to append inquiry row to Google Sheet (${appendRes.status}): ${errBody}`);
  }

  const appendData = await appendRes.json();

  return {
    spreadsheetId: targetSpreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSpreadsheetId}`,
    sheetTitle,
    tabName,
    updatedRange: appendData?.updates?.updatedRange,
  };
}

/**
 * Sends an email notification via the server-side Zoho Mail endpoint (/api/zoho-mail/send).
 */
export async function sendZohoMailNotification(
  recipientEmail: string,
  payload: WorkspaceInquiryPayload
): Promise<ZohoMailSyncResult> {
  const emailContent = buildZohoEmailContent(recipientEmail, payload);

  const res = await fetch('/api/zoho-mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipientEmail: emailContent.recipientEmail,
      replyTo: emailContent.replyTo,
      subject: emailContent.subject,
      textBody: emailContent.textBody,
      htmlBody: emailContent.htmlBody,
      inquiry: payload,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Zoho Mail notification failed (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  return {
    messageId: data.messageId || `zoho-${Date.now()}`,
    recipientEmail: data.recipientEmail || emailContent.recipientEmail,
    subject: emailContent.subject,
    mode: data.mode || 'zoho_smtp',
    smtpHost: data.smtpHost,
    timestamp: data.timestamp || new Date().toISOString(),
    textPreview: emailContent.textBody,
    mailtoUrl: emailContent.mailtoUrl,
  };
}
