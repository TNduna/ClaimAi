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
      const note = daggerAsteriskPairs[code].note || '';

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
 * Standardizes raw web text-input delimiters to the NDoH electronic submission format: CODE_/_CODE
 * Example: "M79.20/I15.0" => "M79.20 / I15.0"
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
self.formatElectronicClaimsDelimiter = formatElectronicClaimsDelimiter;
