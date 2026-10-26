import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEmail, validateName, validatePhone, validateInquiryForm } from './validation';

test('validateEmail validates RFC compliant email addresses', () => {
  assert.equal(validateEmail('engineering@trever.dev'), true);
  assert.equal(validateEmail('alex.smith@company.co.uk'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail(''), false);
});

test('validateName checks minimum name length', () => {
  assert.equal(validateName('Trever Dev'), true);
  assert.equal(validateName('A'), false);
  assert.equal(validateName('   '), false);
});

test('validatePhone checks valid phone formats when provided', () => {
  assert.equal(validatePhone('+1 (555) 019-2834'), true);
  assert.equal(validatePhone(''), true); // optional
  assert.equal(validatePhone('abc'), false);
});

test('validateInquiryForm verifies full inquiry form data', () => {
  const validData = {
    fullName: 'Sarah Connor',
    email: 's.connor@cyberdyne.io',
    companyName: 'Cyberdyne Systems',
    projectDescription: 'We need a modern cloud architecture and workflow automation system.',
    selectedServices: ['custom-software', 'cloud-devops'],
  };

  const result = validateInquiryForm(validData);
  assert.equal(result.isValid, true);
  assert.equal(Object.keys(result.errors).length, 0);

  const invalidData = {
    fullName: '',
    email: 'bad-email',
    projectDescription: 'Too short',
    selectedServices: [],
  };

  const invalidResult = validateInquiryForm(invalidData);
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.fullName);
  assert.ok(invalidResult.errors.email);
  assert.ok(invalidResult.errors.projectDescription);
  assert.ok(invalidResult.errors.selectedServices);
});
