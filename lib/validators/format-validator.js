// lib/validators/format-validator.js
(function () {
  function validateClaimLineFormat(rawInput, parsedCodes, config = {}) {
    const findings = [];
    if (typeof rawInput !== 'string' || !rawInput) return findings;

    const maxCodes = config.maxCodesPerLine || 10;
    const delimiter = config.delimiter || ' / ';

    // 1. Max codes per line
    if (parsedCodes.length > maxCodes) {
      findings.push({
        type: 'FORMAT_ERROR',
        message: `Maximum of ${maxCodes} ICD-10 codes per line item exceeded (found ${parsedCodes.length} codes).`
      });
    }

    // 2. Ditto marks
    if (rawInput.includes('"') || rawInput.includes('”') || rawInput.includes('“')) {
      findings.push({
        type: 'FORMAT_ERROR',
        message: 'Using ditto characters (") to indicate repeated diagnosis codes is not allowed.'
      });
    }

    // 3. Delimiter checks
    if (parsedCodes.length > 1) {
      if (rawInput.includes('/') && !rawInput.includes(delimiter)) {
        findings.push({
          type: 'FORMAT_ERROR',
          message: `Multiple codes must be separated by exactly "${delimiter}" (space, forward slash, space).`
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

  // Expose
  const target = (typeof self !== 'undefined') ? self : global;
  target.ClaimAiFormatValidator = { validateClaimLineFormat };
})();
