// lib/code-conflicts.js (classic script)
// Utilities for validating code sequences and formatting electronic claim delimiters.
/**
 * Validate code ordering and dagger/asterisk pairing.
 * @param {string[]} codes - Array of code strings (may include dots)
 * @param {Object} daggerAsteriskPairs - optional mapping of asterisk -> dagger
 * @returns {Array} findings
 */
function validateCodingSequence(codes, daggerAsteriskPairs = {}) {
  const findings = [];
  if (!Array.isArray(codes)) return findings;

  const normalizedList = codes.map(c => c.toUpperCase().replace(/\./g, ''));

  normalizedList.forEach((code, index) => {
    // If this code is an asterisk-manifestation (exists as key in mapping), ensure correct preceding dagger
    if (daggerAsteriskPairs && daggerAsteriskPairs[code]) {
      const expectedDagger = daggerAsteriskPairs[code];
      if (index === 0) {
        findings.push({
          type: 'SEQUENCE_ERROR',
          message: `Asterisk code ${code} cannot be placed in the primary position. It requires a primary Dagger code.`
        });
      } else if (normalizedList[index - 1] !== expectedDagger) {
        findings.push({
          type: 'PAIRING_ERROR',
          message: `Asterisk code ${code} is not preceded by its designated Dagger code (${expectedDagger}).`
        });
      }
    }
  });

  return findings;
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
self.validateCodingSequence = validateCodingSequence;
self.formatElectronicClaimsDelimiter = formatElectronicClaimsDelimiter;
// Code conflicts placeholder
