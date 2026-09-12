import { AadhaarValidationErrorCode } from './errors';
import { validateVerhoeff } from './verhoeff';

export interface AadhaarValidationResult {
  /**
   * Whether the Aadhaar number is valid according to UIDAI specifications and Verhoeff checksum.
   */
  isValid: boolean;

  /**
   * Sanitized 12-digit Aadhaar number string without spaces or hyphens, if valid.
   */
  cleanAadhaar?: string;

  /**
   * Human-readable error message explaining why validation failed, if invalid.
   */
  error?: string;

  /**
   * Machine-readable error code, if invalid.
   */
  code?: AadhaarValidationErrorCode;
}

/**
 * Validates an Indian Aadhaar number against UIDAI specifications:
 * 1. Must be a 12-digit numeric sequence (spaces and hyphens are automatically sanitized).
 * 2. Must not start with 0 or 1 (UIDAI reserved prefix rule).
 * 3. Must not consist of 12 identical digits (e.g. 222222222222).
 * 4. Must pass the dihedral group D5 Verhoeff checksum algorithm.
 *
 * @param aadhaar - The raw Aadhaar string to validate
 * @returns AadhaarValidationResult
 */
export function validateAadhaar(aadhaar: string): AadhaarValidationResult {
  if (typeof aadhaar !== 'string') {
    return {
      isValid: false,
      error: 'Aadhaar number must be a string',
      code: 'INVALID_TYPE',
    };
  }

  const clean = aadhaar.replace(/[\s-]/g, '');

  if (clean.length === 0) {
    return {
      isValid: false,
      error: 'Aadhaar number cannot be empty',
      code: 'EMPTY_INPUT',
    };
  }

  if (!/^\d+$/.test(clean)) {
    return {
      isValid: false,
      error: 'Aadhaar number must contain only digits, spaces, or hyphens',
      code: 'CONTAINS_NON_DIGITS',
    };
  }

  if (clean.length !== 12) {
    return {
      isValid: false,
      error: `Aadhaar number must be exactly 12 digits (received ${clean.length})`,
      code: 'INVALID_LENGTH',
    };
  }

  // UIDAI rule: Aadhaar number never starts with 0 or 1
  if (clean.startsWith('0') || clean.startsWith('1')) {
    return {
      isValid: false,
      error: `Aadhaar number cannot start with '${clean[0]}' (reserved by UIDAI)`,
      code: 'RESERVED_PREFIX',
    };
  }

  // Reject consecutive repeating identical digits (all 12 digits identical)
  if (/^(\d)\1{11}$/.test(clean)) {
    return {
      isValid: false,
      error: 'Aadhaar number cannot consist of 12 identical digits',
      code: 'REPEATING_DIGITS',
    };
  }

  // Verhoeff checksum algorithm verification
  if (!validateVerhoeff(clean)) {
    return {
      isValid: false,
      error: 'Aadhaar number failed Verhoeff checksum verification',
      code: 'INVALID_CHECKSUM',
    };
  }

  return {
    isValid: true,
    cleanAadhaar: clean,
  };
}

/**
 * Convenience helper that returns a simple boolean indicating Aadhaar validity.
 *
 * @param aadhaar - Aadhaar string to validate
 * @returns true if valid, false otherwise
 */
export function isValidAadhaar(aadhaar: string): boolean {
  return validateAadhaar(aadhaar).isValid;
}
