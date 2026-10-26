/**
 * TITAN Security Utilities: Defensive Sanitization, XSS & Injection Guards, Safe Storage & JSON Parsing
 */

/**
 * Strips dangerous HTML tags, javascript: pseudo-protocols, event handlers,
 * and dangerous unprintable ASCII / null-byte control characters.
 */
export function sanitizeInput(input: unknown, maxLength = 2000): string {
  if (input === null || input === undefined) {
    return '';
  }

  let str = String(input);

  // 1. Strip null bytes and unprintable ASCII control characters (keep \t, \n, \r)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Remove script tags and embedded contents
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 3. Remove inline event handlers like onerror=, onclick=, onload=, etc.
  str = str.replace(/\bon\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, '');

  // 4. Neutralize javascript: and vbscript: URIs
  str = str.replace(/(javascript|vbscript|data):/gi, '$1_:');

  // 5. Strip dangerous HTML brackets
  str = str.replace(/[<>]/g, '');

  // 6. Enforce maximum character boundary to prevent ReDoS / payload bloat
  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  return str.trim();
}

/**
 * Escapes characters for safe output in contexts where raw HTML could be interpreted.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Inspects a string for common XSS vectors (script tags, event handlers, pseudo protocols).
 */
export function containsXSSPayload(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const lower = input.toLowerCase();
  const xssPatterns = [
    /<script\b/i,
    /<\/script>/i,
    /<img\b[^>]*\bon\w+\s*=/i,
    /<svg\b[^>]*\bon\w+\s*=/i,
    /<iframe\b/i,
    /<embed\b/i,
    /<object\b/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /\bonerror\s*=/i,
    /\bonclick\s*=/i,
    /\bonload\s*=/i,
    /\beval\s*\(/i,
  ];

  return xssPatterns.some(pattern => pattern.test(lower));
}

/**
 * Detects common SQL injection patterns (tautologies, UNION SELECT, comment truncation).
 */
export function containsSQLiPattern(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const sqliPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /\b(or|and)\b\s+["']?\d+["']?\s*=\s*["']?\d+/i,
    /\bunion\s+select\b/i,
    /\bdrop\s+table\b/i,
    /\bselect\b.*\bfrom\b/i,
    /\binsert\s+into\b/i,
    /\bupdate\b.*\bset\b/i,
    /\bdelete\s+from\b/i,
    /;\s*--/i,
  ];

  return sqliPatterns.some(pattern => pattern.test(input));
}

/**
 * Safely parses JSON with fallback, preventing prototype pollution attacks.
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonString, (key, value) => {
      // Disallow __proto__, constructor, and prototype injection
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });

    if (parsed === null || parsed === undefined) {
      return fallback;
    }

    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Safe LocalStorage wrapper guarded against quota limits, disabled storage, and exceptions.
 */
export const safeStorage = {
  getItem<T>(key: string, fallback: T): T {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const val = window.localStorage.getItem(key);
      return safeJsonParse<T>(val, fallback);
    } catch {
      return fallback;
    }
  },

  setItem(key: string, value: unknown): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};
