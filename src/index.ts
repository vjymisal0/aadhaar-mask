// Error classes and types
export { AadhaarValidationError, type AadhaarValidationErrorCode } from './errors';

// Verhoeff algorithm functions and tables
export {
  validateVerhoeff,
  generateVerhoeffCheckDigit,
  appendVerhoeffCheckDigit,
  D5_TABLE,
  PERMUTATION_TABLE,
  INVERSE_TABLE,
} from './verhoeff';

// Aadhaar validation
export {
  validateAadhaar,
  isValidAadhaar,
  type AadhaarValidationResult,
} from './validator';

// Aadhaar masking
export {
  maskAadhaar,
  isAadhaarMasked,
  type AadhaarMaskOptions,
} from './masker';

// Aadhaar formatting
export {
  formatAadhaar,
  unformatAadhaar,
} from './formatter';

// Test generator
export {
  generateAadhaar,
  type GenerateAadhaarOptions,
} from './generator';
