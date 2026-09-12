import { generateVerhoeffCheckDigit } from './verhoeff';
import { formatAadhaar } from './formatter';

export interface GenerateAadhaarOptions {
  /**
   * Separator between 4-digit groups (e.g. ' ' or '-').
   * If not provided, returns raw 12-digit string without separators.
   */
  separator?: string;
}

/**
 * Generates a synthetically valid 12-digit Aadhaar number compliant with UIDAI format rules
 * and Verhoeff checksum algorithm. Ideal for test suites, staging environments, and mock KYC flows.
 *
 * Notice: This generates mathematically valid numbers for testing only and does NOT represent
 * an issued identity.
 *
 * @param options - Generation options (optional separator)
 * @returns 12-digit valid Aadhaar string
 */
export function generateAadhaar(options?: GenerateAadhaarOptions): string {
  // First digit must be between 2 and 9 (UIDAI reserve rule: 0 and 1 never used)
  const firstDigit = Math.floor(Math.random() * 8) + 2;

  let remaining10Digits = '';
  // Generate next 10 digits
  for (let i = 0; i < 10; i++) {
    remaining10Digits += Math.floor(Math.random() * 10).toString();
  }

  const base11 = `${firstDigit}${remaining10Digits}`;

  // Guard against impossible edge case of all 11 identical digits
  if (/^(\d)\1{10}$/.test(base11)) {
    return generateAadhaar(options);
  }

  const checkDigit = generateVerhoeffCheckDigit(base11);
  const full12 = `${base11}${checkDigit}`;

  // Guard against all 12 identical digits
  if (/^(\d)\1{11}$/.test(full12)) {
    return generateAadhaar(options);
  }

  if (options?.separator !== undefined) {
    return formatAadhaar(full12, options.separator);
  }

  return full12;
}
