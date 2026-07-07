// lib/code-conflicts.js (classic script)
// Utilities for validating code sequences and formatting electronic claim delimiters.

/**
 * Checks if a normalized code is prohibited from being in the primary position (PDX).
 * Prohibited primaries: External causes (V01-Y98), Sequelae, B95-B98, Z37, Z21.
 * @param {string} code - Normalized uppercase code (no dots)
 * @returns {Object|null} Object with reason if prohibited, else null.
 */
function getProhibitedPrimaryReason(code) {
  if (!code) return null;
  const clean = code.toUpperCase().replace(/\./g, '');

  // 1. External Cause Codes (V01 - Y98)
  if (/^[V-Y]\d{2}/.test(clean)) {
    const prefix = clean.substring(0, 3);
    const letter = prefix[0];
    const num = parseInt(prefix.substring(1), 10);
    if (letter >= 'V' && letter <= 'Y' && !isNaN(num) && num >= 0) {
      // Exclude Y99 if rule specifies exactly V01-Y98, but standard covers Y99 as well
      if (!(letter === 'Y' && num > 98)) {
        return { type: 'PROHIBITED_PRIMARY', message: `External Cause Code (${prefix}) cannot be used in the primary position.` };
      }
    }
  }

  // 2. Sequelae Codes (I69, T90-T98, Y85-Y89, B94, E64, G09, O97)
  if (/^I69/.test(clean)) return { type: 'PROHIBITED_PRIMARY', message: 'Sequelae Code (I69) cannot be used in the primary position.' };
  if (/^T9[0-8]/.test(clean)) return { type: 'PROHIBITED_PRIMARY', message: 'Sequelae Code (T90-T98) cannot be used in the primary position.' };
  if (/^Y8[5-9]/.test(clean)) return { type: 'PROHIBITED_PRIMARY', message: 'Sequelae of External Cause Code (Y85-Y89) cannot be used in the primary position.' };
  if (/^B94/.test(clean)) return { type: 'PROHIBITED_PRIMARY', message: 'Sequelae Code (B94) cannot be used in the primary position.' };
  if (/^E64/.test(clean)) return { type: 'PROHIBITED_PRIMARY', message: 'Sequelae Code (E64) cannot be used in the primary position.' };
  if (/^G09/.test(clean)) return { type: 'PROHIBITED_PRIMARY', message: 'Sequelae Code (G09) cannot be used in the primary position.' };
  if (/^O97/.test(clean)) return { type: 'PROHIBITED_PRIMARY', message: 'Sequelae Code (O97) cannot be used in the primary position.' };

  // 3. Causative Organism Codes (B95-B98)
  if (/^B9[5-8]/.test(clean)) {
    return { type: 'PROHIBITED_PRIMARY', message: `Causative Organism Code (${clean.substring(0, 3)}) cannot be used in the primary position.` };
  }

  // 4. Outcome of Delivery (Z37)
  if (/^Z37/.test(clean)) {
    return { type: 'PROHIBITED_PRIMARY', message: 'Outcome of Delivery Code (Z37) cannot be used in the primary position.' };
  }

  // 5. Asymptomatic HIV Status (Z21)
  if (/^Z21/.test(clean)) {
    return { type: 'PROHIBITED_PRIMARY', message: 'Asymptomatic HIV Status Code (Z21) cannot be used in the primary position.' };
  }

  return null;
}

/**
 * Validate code ordering and dagger/asterisk pairing.
 * @param {string[]} codes - Array of raw code strings
 * @param {Object} daggerAsteriskPairs - mapping of asterisk -> dagger
 * @returns {Object} { findings: Array, suggestedPrimary: string|null, requiresReorder: boolean }
 */
function validateCodingSequence(codes, daggerAsteriskPairs = {}) {
  const findings = [];
  let suggestedPrimary = null;
  let requiresReorder = false;

  if (!Array.isArray(codes) || codes.length === 0) {
    return { findings, suggestedPrimary, requiresReorder };
  }

  // 1. Check for symbol warnings (electronic claims)
  codes.forEach(code => {
    if (code.includes('+') || code.includes('*')) {
      findings.push({
        type: 'SYMBOL_WARNING',
        code: code,
        message: `Code ${code} contains dagger (+) or asterisk (*) symbols. These must be dropped for electronic claims.`
      });
    }
  });

  const normalizedList = codes.map(c => c.toUpperCase().replace(/[\.\+\*]/g, '').trim());

  // 2. Validate Primary Position (PDX)
  if (normalizedList.length > 0) {
    const primaryCode = normalizedList[0];
    const rawPrimary = codes[0];
    const prohibited = getProhibitedPrimaryReason(primaryCode);
    if (prohibited) {
      findings.push({
        type: 'PRIMARY_ERROR',
        code: rawPrimary,
        message: prohibited.message
      });
      requiresReorder = true;
    }
  }

  // 3. Validate Dagger/Asterisk Sequencing & Pairings
  normalizedList.forEach((code, index) => {
    // Check if current code is an asterisk code (exists in our dagger-asterisk index mapping)
    if (daggerAsteriskPairs && daggerAsteriskPairs[code]) {
      const expectedDaggers = daggerAsteriskPairs[code].pairedWith || [];

      if (index === 0) {
        findings.push({
          type: 'SEQUENCE_ERROR',
          code: codes[index],
          message: `Asterisk code ${codes[index]} cannot be in the primary position. It requires a preceding Dagger code.`
        });
        requiresReorder = true;
      } else {
        const precedingCode = normalizedList[index - 1];
        // Verify if the preceding code is one of the expected dagger codes for this asterisk
        const isPaired = expectedDaggers.some(expectedDagger => {
          const cleanExpected = expectedDagger.toUpperCase().replace(/[\.\+\*]/g, '').trim();
          return precedingCode.startsWith(cleanExpected);
        });

        if (!isPaired && expectedDaggers.length > 0) {
          findings.push({
            type: 'PAIRING_ERROR',
            code: codes[index],
            message: `Asterisk code ${codes[index]} is not preceded by a valid Dagger code (${expectedDaggers.join(' or ')}).`
          });
        }
      }
    }
  });

  // 4. Suggest Primary Diagnosis if current one is prohibited
  const primaryProhibited = getProhibitedPrimaryReason(normalizedList[0]);
  if (primaryProhibited || (daggerAsteriskPairs && daggerAsteriskPairs[normalizedList[0]])) {
    // Look for the first non-prohibited, non-asterisk code in the rest of the list
    const candidateIndex = normalizedList.findIndex((code) => {
      const isAst = !!(daggerAsteriskPairs && daggerAsteriskPairs[code]);
      return !getProhibitedPrimaryReason(code) && !isAst;
    });

    if (candidateIndex !== -1) {
      suggestedPrimary = codes[candidateIndex];
    }
  }

  return {
    findings,
    suggestedPrimary,
    requiresReorder
  };
}

/**
 * Validates the raw claim line formatting based on GSN0103-GSN0105.
 * @param {string} rawInput - The raw string input from the page.
 * @param {string[]} parsedCodes - Array of parsed raw codes.
 * @returns {Array} List of formatting findings.
 */
function validateClaimLineFormat(rawInput, parsedCodes) {
  const findings = [];
  if (typeof rawInput !== 'string' || !rawInput) return findings;

  // 1. Max 10 codes per line
  if (parsedCodes.length > 10) {
    findings.push({
      type: 'FORMAT_ERROR',
      message: `Maximum of 10 ICD-10 codes per line item exceeded (found ${parsedCodes.length} codes).`
    });
  }

  // 2. Forbidden characters (ditto marks)
  if (rawInput.includes('"') || rawInput.includes('”') || rawInput.includes('“')) {
    findings.push({
      type: 'FORMAT_ERROR',
      message: 'Using ditto characters (") to indicate repeated diagnosis codes is not allowed.'
    });
  }

  // 3. Delimiter checks
  if (parsedCodes.length > 1) {
    if (rawInput.includes('/') && !rawInput.includes(' / ')) {
      findings.push({
        type: 'FORMAT_ERROR',
        message: 'Multiple codes must be separated by exactly " / " (space, forward slash, space).'
      });
    }
  }

  // 4. Validate individual code formatting
  parsedCodes.forEach(code => {
    const clean = code.trim();
    
    // Check for brackets, hyphens, spaces
    if (clean.includes('(') || clean.includes(')') || clean.includes('[') || clean.includes(']')) {
      findings.push({
        type: 'FORMAT_ERROR',
        code: clean,
        message: `Brackets are not allowed within ICD-10 codes (${clean}).`
      });
    }
    if (clean.includes('-')) {
      findings.push({
        type: 'FORMAT_ERROR',
        code: clean,
        message: `Hyphens are not allowed within ICD-10 codes (${clean}).`
      });
    }
    if (/\s/.test(clean.replace(/^\s+|\s+$/g, ''))) {
      findings.push({
        type: 'FORMAT_ERROR',
        code: clean,
        message: `Spaces are not allowed within individual ICD-10 codes (${clean}).`
      });
    }

    // Strip symbols for character count and dot checks
    const baseCode = clean.replace(/[\+\*\.]/g, '');
    const codeNoSymbols = clean.replace(/[\+\*]/g, '');

    // Dot rules (3-character vs extended)
    if (baseCode.length === 3) {
      if (codeNoSymbols.includes('.')) {
        findings.push({
          type: 'FORMAT_ERROR',
          code: clean,
          message: `3-character codes must exclude the dot (e.g. ${baseCode} instead of ${codeNoSymbols}).`
        });
      }
    } else if (baseCode.length > 3) {
      if (!codeNoSymbols.includes('.')) {
        const dotSuggested = `${baseCode.slice(0, 3)}.${baseCode.slice(3)}`;
        findings.push({
          type: 'FORMAT_ERROR',
          code: clean,
          message: `Extended character codes must include the dot (e.g. ${dotSuggested} instead of ${codeNoSymbols}).`
        });
      } else {
        const dotIndex = codeNoSymbols.indexOf('.');
        if (dotIndex !== 3) {
          findings.push({
            type: 'FORMAT_ERROR',
            code: clean,
            message: `Dot in code ${clean} is in the wrong position. It must be after the first 3 characters.`
          });
        }
      }
    }
  });

  return findings;
}

/**
 * Generates the clean electronic submission format for a set of codes.
 * Drops symbols (+/*), enforces dot rules, and uses space-slash-space delimiters.
 * @param {string[]} parsedCodes
 * @returns {string} Clean submission format preview.
 */
function generateSubmissionPreview(parsedCodes) {
  if (!Array.isArray(parsedCodes) || parsedCodes.length === 0) return '';
  
  const cleanedCodes = parsedCodes.slice(0, 10).map(code => {
    // Drop all spaces, hyphens, brackets, ditto, and dagger/asterisk symbols
    let clean = code.toUpperCase().replace(/[\+\*\s\(\)\[\]\-\"]/g, '');
    const base = clean.replace(/\./g, '');
    
    if (base.length === 3) {
      return base;
    } else if (base.length > 3) {
      return `${base.slice(0, 3)}.${base.slice(3)}`;
    }
    return clean;
  });

  return cleanedCodes.join(' / ');
}

/**
 * Standardizes raw web text-input delimiters to the NDoH electronic submission format: CODE_/_CODE
 */
function formatElectronicClaimsDelimiter(rawInputString) {
  if (typeof rawInputString !== 'string') return rawInputString;
  let sanitized = rawInputString.toUpperCase()
    .replace(/[\-\s]+/g, '') // remove hyphens and spaces
    .replace(/\//g, ' / '); // ensure space/slash/space
  // collapse multiple spaces
  sanitized = sanitized.replace(/\s{2,}/g, ' ');
  return sanitized;
}

// Bind to global scope
self.getProhibitedPrimaryReason = getProhibitedPrimaryReason;
self.validateCodingSequence = validateCodingSequence;
self.validateClaimLineFormat = validateClaimLineFormat;
self.generateSubmissionPreview = generateSubmissionPreview;
self.formatElectronicClaimsDelimiter = formatElectronicClaimsDelimiter;
