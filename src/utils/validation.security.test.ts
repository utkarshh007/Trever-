import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  validateName,
  validatePhone,
  validateInquiryForm,
} from './validation';

test('validateEmail strictly enforces RFC limits and rejects malicious formats', () => {
  // Valid emails
  assert.equal(validateEmail('alex@trever.dev'), true);
  assert.equal(validateEmail('engineering+pod@domain.co.uk'), true);
  assert.equal(validateEmail('user.name123@sub.domain.org'), true);

  // Invalid / malicious emails
  assert.equal(validateEmail('plainaddress'), false);
  assert.equal(validateEmail('@missing-username.com'), false);
  assert.equal(validateEmail('username@.com'), false);
  assert.equal(validateEmail('user@domain'), false);
  assert.equal(validateEmail('user<script>@domain.com'), false);
  assert.equal(validateEmail('user\n@domain.com'), false);
  assert.equal(validateEmail('a'.repeat(250) + '@example.com'), false); // exceeds 254 RFC limit
  assert.equal(validateEmail(''), false);
  assert.equal(validateEmail(null as any), false);
});

test('validateName rejects XSS injections, pure whitespace, and enforces boundary lengths', () => {
  assert.equal(validateName('John Doe'), true);
  assert.equal(validateName('Dr. Hélène Müller-Lefèvre'), true);
  assert.equal(validateName('X'), false); // too short
  assert.equal(validateName('   '), false);
  assert.equal(validateName('B'.repeat(101)), false); // exceeds 100 char limit
  assert.equal(validateName('<script>alert("hacked")</script>'), false);
  assert.equal(validateName('<img onerror=evil()>'), false);
  assert.equal(validateName(undefined as any), false);
});

test('validatePhone permits optional empty phone and validates legitimate formats', () => {
  assert.equal(validatePhone(''), true);
  assert.equal(validatePhone(undefined), true);
  assert.equal(validatePhone('+1 (555) 019-2834'), true);
  assert.equal(validatePhone('020-7946-0991'), true);
  assert.equal(validatePhone('+44 20 7946 0991'), true);

  // Malicious or invalid phones
  assert.equal(validatePhone('123'), false); // too short
  assert.equal(validatePhone('phone; drop table;'), false);
  assert.equal(validatePhone('<script>'), false);
  assert.equal(validatePhone('1234567890123456789012345678901'), false); // > 25 chars
});

test('validateInquiryForm handles XSS attack payloads securely and provides sanitized data', () => {
  const attackPayload = {
    fullName: '<script>alert("pwned")</script>Sarah Connor',
    email: 'sarah.connor@sky.net',
    companyName: 'Cyberdyne <img src=x onerror=steal()>',
    phone: '+1 555-019-9999',
    projectDescription: 'We need an autonomous operations platform with neural networks.',
    selectedServices: ['custom-software', 'ai-ml'],
  };

  const result = validateInquiryForm(attackPayload);
  // Full name contained script tag, so validator flags security warning
  assert.equal(result.isValid, false);
  assert.equal(result.errors.fullName?.includes('Security warning'), true);

  // When submitting sanitized/clean input
  const validPayload = {
    fullName: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.org',
    companyName: 'Cyberdyne Systems',
    phone: '+1 555-019-9999',
    projectDescription: 'Building high-availability distributed systems for robotics logistics.',
    selectedServices: ['custom-software', 'cloud-devops'],
  };

  const validResult = validateInquiryForm(validPayload);
  assert.equal(validResult.isValid, true);
  assert.equal(Object.keys(validResult.errors).length, 0);
  assert.equal(validResult.sanitizedData.fullName, 'Sarah Connor');
  assert.equal(validResult.sanitizedData.companyName, 'Cyberdyne Systems');
  assert.deepEqual(validResult.sanitizedData.selectedServices, ['custom-software', 'cloud-devops']);
});

test('validateInquiryForm enforces service selection and minimum description length', () => {
  const invalidResult = validateInquiryForm({
    fullName: 'John Doe',
    email: 'john@example.com',
    projectDescription: 'Too short',
    selectedServices: [],
  });

  assert.equal(invalidResult.isValid, false);
  assert.equal(invalidResult.errors.projectDescription !== undefined, true);
  assert.equal(invalidResult.errors.selectedServices !== undefined, true);
});
