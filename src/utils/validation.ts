import { sanitizeInput, containsXSSPayload } from './security';

export interface InquiryFormData {
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
  projectDescription: string;
  selectedServices: string[];
  budgetTier?: string;
}

export interface ValidationErrors {
  fullName?: string;
  email?: string;
  projectDescription?: string;
  selectedServices?: string;
  phone?: string;
  companyName?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
  sanitizedData: InquiryFormData;
}

/**
 * Validates email according to RFC 5321 length limits (max 254 chars) and standard RFC format.
 * Blocks embedded script tags, newlines, or control characters.
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254 || trimmed.length < 5) return false;
  if (/[\r\n\x00-\x1F\x7F<>]/.test(trimmed)) return false;

  // RFC-compliant safe regex (guarded against polynomial backtracking / ReDoS)
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(trimmed);
}

/**
 * Validates name with minimum 2 characters, maximum 100 characters.
 * Rejects pure symbol strings, script injections, and unprintable characters.
 */
export function validateName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  if (containsXSSPayload(trimmed)) return false;
  // Must contain at least one unicode letter or alphanumeric character
  return /[\p{L}\p{N}]/u.test(trimmed);
}

/**
 * Validates optional phone number format (between 7 and 25 characters when provided).
 */
export function validatePhone(phone?: string): boolean {
  if (!phone || phone.trim() === '') return true; // Optional field
  const trimmed = phone.trim();
  if (trimmed.length < 7 || trimmed.length > 25) return false;
  const re = /^[\d\+\-\(\)\s.]{7,25}$/;
  return re.test(trimmed);
}

/**
 * Full inquiry form validator with deep security sanitization and XSS neutralization.
 */
export function validateInquiryForm(data: InquiryFormData): ValidationResult {
  const errors: ValidationErrors = {};

  const sanitizedFullName = sanitizeInput(data.fullName, 100);
  const sanitizedEmail = sanitizeInput(data.email, 254);
  const sanitizedCompanyName = data.companyName ? sanitizeInput(data.companyName, 120) : '';
  const sanitizedPhone = data.phone ? sanitizeInput(data.phone, 30) : '';
  const sanitizedProjectDescription = sanitizeInput(data.projectDescription, 5000);

  // Validate Full Name
  if (!validateName(data.fullName)) {
    if (containsXSSPayload(data.fullName)) {
      errors.fullName = 'Security warning: Invalid characters or script tags detected.';
    } else {
      errors.fullName = 'Please enter a valid full name (2 to 100 characters).';
    }
  }

  // Validate Work Email
  if (!validateEmail(data.email)) {
    errors.email = 'Please provide a valid work email address (max 254 characters).';
  }

  // Validate Project Brief
  if (!data.projectDescription || data.projectDescription.trim().length < 10) {
    errors.projectDescription = 'Please describe your project or goal (minimum 10 characters).';
  } else if (data.projectDescription.length > 5000) {
    errors.projectDescription = 'Project description exceeds maximum length of 5,000 characters.';
  } else if (containsXSSPayload(data.projectDescription)) {
    errors.projectDescription = 'Security warning: Script tags or unsafe HTML are not permitted.';
  }

  // Validate Selected Services
  const safeServices = Array.isArray(data.selectedServices)
    ? data.selectedServices.filter(s => typeof s === 'string' && s.length > 0 && s.length < 60)
    : [];

  if (safeServices.length === 0) {
    errors.selectedServices = 'Please select at least one core service area.';
  }

  // Validate Telephone if provided
  if (data.phone && data.phone.trim() !== '') {
    if (!validatePhone(data.phone)) {
      errors.phone = 'Please enter a valid telephone format (e.g. +1 555-019-2834).';
    }
  }

  const sanitizedData: InquiryFormData = {
    fullName: sanitizedFullName,
    email: sanitizedEmail,
    companyName: sanitizedCompanyName,
    phone: sanitizedPhone,
    projectDescription: sanitizedProjectDescription,
    selectedServices: safeServices,
    budgetTier: data.budgetTier ? sanitizeInput(data.budgetTier, 40) : undefined,
  };

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
}
