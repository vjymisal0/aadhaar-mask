# aadhaar-mask 🇮🇳

[![npm version](https://img.shields.io/npm/v/aadhaar-mask.svg?color=blue)](https://www.npmjs.com/package/aadhaar-mask)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](#)
[![Dual ESM/CJS](https://img.shields.io/badge/module-ESM%20%2B%20CJS-orange.svg)](#)

> **Zero-dependency, regulation-compliant Indian Aadhaar number validator, Verhoeff checksum verifier, and 8-digit secure masker (`XXXX XXXX 1234`) mandated by UIDAI and RBI.**

---

## 📑 Table of Contents

- [Why aadhaar-mask?](#why-aadhaar-mask)
- [Regulatory Context (UIDAI & RBI Compliance)](#regulatory-context-uidai--rbi-compliance)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [`validateAadhaar`](#validateaadhaar)
  - [`isValidAadhaar`](#isvalidaadhaar)
  - [`maskAadhaar`](#maskaadhaar)
  - [`isAadhaarMasked`](#isaadhaarmasked)
  - [`validateVerhoeff`](#validateverhoeff)
  - [`generateVerhoeffCheckDigit`](#generateverhoeffcheckdigit)
  - [`formatAadhaar` & `unformatAadhaar`](#formataadhaar--unformataadhaar)
  - [`generateAadhaar`](#generateaadhaar)
- [Error Handling](#error-handling)
- [Mathematical Underpinnings (Verhoeff Algorithm)](#mathematical-underpinnings-verhoeff-algorithm)
- [Security & Best Practices](#security--best-practices)
- [Contributing & Development](#contributing--development)
- [License](#license)

---

## Why aadhaar-mask?

Storing, displaying, or transmitting unmasked 12-digit Indian Aadhaar numbers is a punishable offense in India under Section 29(4) of the Aadhaar Act and RBI Master Directions.

Many existing implementations rely on naive regular expressions, overlook UIDAI prefix restrictions, or fail to compute the rigorous **dihedral group $D_5$ Verhoeff checksum algorithm**.

`aadhaar-mask` provides:
- **Zero Dependencies**: Pure, battle-tested TypeScript with 0 runtime dependencies.
- **UIDAI & RBI Strict Compliance**: Enforces format rules, 0/1 prefix rejection, consecutive repeating digit rejection, and full Verhoeff checksum verification.
- **Dual ESM & CommonJS**: Ships with `.d.ts`, `.d.mts`, and `.d.cts` for full compatibility with Node.js, Next.js, Vite, Nuxt, Remix, and Bun.
- **Blazing Fast**: Performs in micro-seconds with precomputed static permutation matrices.

---

## Regulatory Context (UIDAI & RBI Compliance)

1. **UIDAI Circular & Aadhaar Act (Section 29(4))**:
   > *"No Aadhaar number or core biometric information collected or created under this Act... shall be published, displayed or posted publicly by any person or entity or agency."*
2. **RBI Master Direction on KYC (Section 16 / 17)**:
   > Regulated Entities (Banks, NBFCs, Payment Aggregators) downloading Aadhaar XML or e-Aadhaar MUST redact or mask the first 8 digits so that only the last 4 digits are visible (`XXXX XXXX 1234`).
3. **CERT-In Guidelines**:
   > Mandates data minimization and tokenization/masking of sensitive personally identifiable information (PII) at rest and in transit.

---

## Features

- 🛡️ **Complete Aadhaar Validation**: Validates length, non-digit sanitization, 0/1 prefix bans, repeating digit bans, and the Verhoeff check.
- 🎭 **Flexible Masking**: Mask with standard spaces (`XXXX XXXX 1234`), hyphens (`XXXX-XXXX-1234`), compact (`XXXXXXXX1234`), or custom characters (`**** **** 1234`).
- 🧮 **Standalone Verhoeff**: Re-usable $D_5$ checksum validator and check-digit generator for any numeric string.
- 🎨 **Formatting Helpers**: Format and unformat 12-digit numbers cleanly.
- 🧪 **Mock Test Generator**: Generate synthetically valid 12-digit test Aadhaar numbers for local test suites and CI pipelines.
- ⚡ **TypeScript-First**: Complete type safety with structured error codes.

---

## Installation

```bash
# npm
npm install aadhaar-mask

# pnpm
pnpm add aadhaar-mask

# yarn
yarn add aadhaar-mask

# bun
bun add aadhaar-mask
```

---

## Quick Start

### ESM / TypeScript
```typescript
import {
  validateAadhaar,
  maskAadhaar,
  isValidAadhaar,
  formatAadhaar,
} from 'aadhaar-mask';

// 1. Validate an Aadhaar number
const validation = validateAadhaar('2345 6789 0125');
if (validation.isValid) {
  console.log('Clean Aadhaar:', validation.cleanAadhaar);
} else {
  console.error(`Invalid Aadhaar [${validation.code}]: ${validation.error}`);
}

// 2. Mask an Aadhaar number (defaults to "XXXX XXXX 1234")
const masked = maskAadhaar('2345 6789 0125');
console.log(masked); // "XXXX XXXX 0125"

// 3. Quick boolean check
if (isValidAadhaar('2345 6789 0125')) {
  // Proceed with KYC verification
}
```

### CommonJS
```javascript
const { validateAadhaar, maskAadhaar } = require('aadhaar-mask');

const masked = maskAadhaar('234567890125');
console.log(masked); // "XXXX XXXX 0125"
```

---

## API Reference

### `validateAadhaar(aadhaar: string): AadhaarValidationResult`

Validates the input string against all UIDAI specification rules:
- Cleans whitespace and hyphens.
- Ensures exact length of 12 digits.
- Rejects numbers starting with `0` or `1` (reserved by UIDAI).
- Rejects all 12 identical repeating digits (e.g. `222222222222`).
- Verifies mathematical Verhoeff checksum.

**Returns:**
```typescript
interface AadhaarValidationResult {
  isValid: boolean;
  cleanAadhaar?: string;
  error?: string;
  code?: AadhaarValidationErrorCode;
}
```

**Example:**
```typescript
import { validateAadhaar } from 'aadhaar-mask';

// Valid
validateAadhaar('3675 9834 2981');
// => { isValid: true, cleanAadhaar: '367598342981' }

// Invalid starting digit
validateAadhaar('0123 4567 8901');
// => { isValid: false, code: 'RESERVED_PREFIX', error: "Aadhaar number cannot start with '0' (reserved by UIDAI)" }

// Invalid length
validateAadhaar('23456');
// => { isValid: false, code: 'INVALID_LENGTH', error: 'Aadhaar number must be exactly 12 digits (received 5)' }
```

---

### `isValidAadhaar(aadhaar: string): boolean`

Convenient shorthand function returning boolean `true` if valid, `false` otherwise.

```typescript
import { isValidAadhaar } from 'aadhaar-mask';

if (!isValidAadhaar(userInput)) {
  throw new Error('Please provide a valid 12-digit Aadhaar number');
}
```

---

### `maskAadhaar(aadhaar: string, options?: AadhaarMaskOptions): string`

Masks the first 8 digits of a 12-digit Aadhaar number, leaving only the last 4 digits visible.

**Options:**
```typescript
interface AadhaarMaskOptions {
  /**
   * Separator between 4-digit groups.
   * Default: ' ' (space) -> "XXXX XXXX 1234"
   */
  separator?: string;

  /**
   * Mask character for each hidden digit. Must be a single char.
   * Default: 'X'
   */
  maskChar?: string;

  /**
   * Pre-masking validation mode:
   * - true | 'strict': Full UIDAI + Verhoeff validation. Throws AadhaarValidationError if invalid.
   * - 'lenient': Requires 12 numeric digits, skips checksum.
   * - false | 'none': Skips validation beyond 12 numeric digits.
   * Default: true
   */
  validate?: boolean | 'strict' | 'lenient' | 'none';
}
```

**Examples:**
```typescript
import { maskAadhaar } from 'aadhaar-mask';

const num = '367598342981';

// Default: spaced 4-digit groups
maskAadhaar(num);
// => "XXXX XXXX 2981"

// Hyphen separated
maskAadhaar(num, { separator: '-' });
// => "XXXX-XXXX-2981"

// Compact (no separator)
maskAadhaar(num, { separator: '' });
// => "XXXXXXXX2981"

// Custom mask character
maskAadhaar(num, { maskChar: '*' });
// => "**** **** 2981"

// Lenient validation for legacy numbers
maskAadhaar('234567890123', { validate: 'lenient' });
// => "XXXX XXXX 0123"
```

---

### `isAadhaarMasked(aadhaar: string): boolean`

Checks if a string is already in a recognized masked Aadhaar format.

```typescript
import { isAadhaarMasked } from 'aadhaar-mask';

isAadhaarMasked('XXXX XXXX 1234'); // true
isAadhaarMasked('XXXX-XXXX-1234'); // true
isAadhaarMasked('XXXXXXXX1234');   // true
isAadhaarMasked('**** **** 1234'); // true
isAadhaarMasked('2345 6789 1234'); // false (unmasked)
```

---

### `validateVerhoeff(numStr: string): boolean`

Performs standalone Verhoeff checksum validation on any numeric string.

```typescript
import { validateVerhoeff } from 'aadhaar-mask';

validateVerhoeff('2363'); // true
validateVerhoeff('2364'); // false
```

---

### `generateVerhoeffCheckDigit(numStr: string): number`

Calculates the single Verhoeff check digit for any base digit string.

```typescript
import { generateVerhoeffCheckDigit, appendVerhoeffCheckDigit } from 'aadhaar-mask';

const check = generateVerhoeffCheckDigit('236'); // 3
const full = appendVerhoeffCheckDigit('236');    // "2363"
```

---

### `formatAadhaar` & `unformatAadhaar`

Pretty-prints or un-formats 12-digit Aadhaar numbers.

```typescript
import { formatAadhaar, unformatAadhaar } from 'aadhaar-mask';

formatAadhaar('234567891234');       // "2345 6789 1234"
formatAadhaar('234567891234', '-');  // "2345-6789-1234"

unformatAadhaar('2345 6789 1234');   // "234567891234"
unformatAadhaar('2345-6789-1234');   // "234567891234"
```

---

### `generateAadhaar(options?: GenerateAadhaarOptions): string`

Generates synthetically valid 12-digit Aadhaar numbers complying with all UIDAI structural rules and the Verhoeff checksum. Ideal for test fixtures, staging databases, and mock KYC pipelines.

> ⚠️ **Notice**: These numbers are mathematically sound synthetic numbers for testing purposes and do not correspond to real citizen records.

```typescript
import { generateAadhaar } from 'aadhaar-mask';

const testAadhaar = generateAadhaar();
// e.g. "582914389024"

const formatted = generateAadhaar({ separator: ' ' });
// e.g. "5829 1438 9024"
```

---

## Error Handling

All thrown errors inherit from `AadhaarValidationError`, exposing an explicit machine-readable `code`:

```typescript
import { maskAadhaar, AadhaarValidationError } from 'aadhaar-mask';

try {
  maskAadhaar('invalid-aadhaar');
} catch (error) {
  if (error instanceof AadhaarValidationError) {
    console.error(error.code);    // e.g. 'CONTAINS_NON_DIGITS'
    console.error(error.message); // Human-readable error description
  }
}
```

### Error Codes

| Code | Cause |
|---|---|
| `INVALID_TYPE` | Input was not a string. |
| `EMPTY_INPUT` | Input string was empty or contained only whitespace. |
| `INVALID_LENGTH` | Sanitized input did not contain exactly 12 digits. |
| `CONTAINS_NON_DIGITS` | Input contained characters other than digits, spaces, or hyphens. |
| `RESERVED_PREFIX` | Input began with `0` or `1` (violating UIDAI rules). |
| `REPEATING_DIGITS` | All 12 digits were identical (e.g. `222222222222`). |
| `INVALID_CHECKSUM` | Input failed the Verhoeff checksum calculation. |
| `INVALID_MASK_CHAR` | The `maskChar` provided was longer or shorter than 1 character. |

---

## Mathematical Underpinnings (Verhoeff Algorithm)

The Verhoeff algorithm was invented by Dutch mathematician Jacobus Verhoeff in 1969. It uses the properties of the non-abelian **dihedral group $D_5$** of order 10 (symmetries of a regular pentagon) combined with a permutation group $P$.

Unlike the standard Luhn algorithm (mod 10) which misses ~10% of adjacent transpositions and all `09 <-> 90` errors, Verhoeff:
- Detects **100%** of single-digit substitution errors ($a \to b$).
- Detects **100%** of adjacent transposition errors ($ab \to ba$).
- Detects **95.3%** of twin errors ($aa \to bb$).
- Detects **94.2%** of jump transpositions ($acb \to bca$).

UIDAI utilizes the Verhoeff algorithm on the 11 base digits to generate the 12th check digit.

---

## Security & Best Practices

1. **Never Log Plaintext Aadhaar**: Always pass through `maskAadhaar()` prior to sending strings to log aggregators (Datadog, CloudWatch, Sentry, etc.).
2. **Database Storage**: According to RBI regulations, non-statutory databases must store only the masked format or an encrypted vault token.
3. **Transmission**: Mask Aadhaar numbers in API responses and frontend payloads whenever display is required.

---

## Contributing & Development

```bash
# Clone the repository
git clone https://github.com/vjymisal0/aadhaar-mask.git
cd aadhaar-mask

# Install dependencies
npm install

# Run unit tests
npm test

# Build dual ESM/CJS bundles
npm run build

# Run type checks
npm run typecheck
```

---

## License

[MIT](LICENSE) © [Vijay Misal](mailto:misalvijay153@gmail.com)
