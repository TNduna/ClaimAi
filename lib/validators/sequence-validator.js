// lib/validators/sequence-validator.js
(function () {
  function getProhibitedPrimaryReason(normalizedCode, config = {}) {
    const categories = (config.prohibitedPrimaries && config.prohibitedPrimaries.categories) || ['V01-Y98', 'B95-B98', 'Z37', 'Z21'];
    const sequelaePrefixes = (config.prohibitedPrimaries && config.prohibitedPrimaries.sequelaePrefixes) || ['I69', 'B94', 'E64', 'G09', 'O97', 'T90', 'T91', 'T92', 'T93', 'T94', 'T95', 'T96', 'T97', 'T98'];

    // 1. External Cause Codes (V01-Y98)
    const matchesCategory = categories.some(cat => {
      if (cat.includes('-')) {
        const [start, end] = cat.split('-');
        const letter = normalizedCode.charAt(0);
        const num = parseInt(normalizedCode.substring(1, 3), 10);
        
        const startLetter = start.charAt(0);
        const endLetter = end.charAt(0);
        const startNum = parseInt(start.substring(1), 10);
        const endNum = parseInt(end.substring(1), 10);
        
        if (letter < startLetter || letter > endLetter) return false;
        if (letter === startLetter && num < startNum) return false;
        if (letter === endLetter && num > endNum) return false;
        return true;
      }
      return normalizedCode.startsWith(cat);
    });

    if (matchesCategory) {
      if (normalizedCode.startsWith('V') || normalizedCode.startsWith('W') || normalizedCode.startsWith('X') || normalizedCode.startsWith('Y')) {
        return { type: 'PRIMARY_ERROR', message: `Code ${normalizedCode} is an External Cause Code (V01-Y98) and cannot be assigned in the primary position (PDX).` };
      }
      if (normalizedCode.startsWith('B95') || normalizedCode.startsWith('B96') || normalizedCode.startsWith('B97') || normalizedCode.startsWith('B98')) {
        return { type: 'PRIMARY_ERROR', message: `Code ${normalizedCode} is a causative agent organism category (B95-B98) and must be coded as secondary.` };
      }
      if (normalizedCode.startsWith('Z37')) {
        return { type: 'PRIMARY_ERROR', message: `Outcome of delivery code ${normalizedCode} (Z37) must only be placed in a secondary position.` };
      }
      if (normalizedCode.startsWith('Z21')) {
        return { type: 'PRIMARY_ERROR', message: `Asymptomatic HIV status code ${normalizedCode} (Z21) must only be placed in a secondary position.` };
      }
    }

    // 2. Sequelae Codes
    const isSequelae = sequelaePrefixes.some(prefix => normalizedCode.startsWith(prefix));
    if (isSequelae) {
      return { type: 'PRIMARY_ERROR', message: `Code ${normalizedCode} is a Sequelae / Late Effect code and cannot be assigned in the primary position (PDX).` };
    }

    return null;
  }

  function validateCodingSequence(codes, daggerAsteriskPairs = {}, config = {}) {
    const findings = [];
    let suggestedPrimary = null;
    let requiresReorder = false;

    if (!Array.isArray(codes) || codes.length === 0) {
      return { findings, suggestedPrimary, requiresReorder };
    }

    // 1. Check for raw symbols
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

    // 2. Prohibited Primaries (PDX)
    if (normalizedList.length > 0) {
      const primaryCode = normalizedList[0];
      const rawPrimary = codes[0];
      const prohibited = getProhibitedPrimaryReason(primaryCode, config);
      if (prohibited) {
        findings.push({
          type: 'PRIMARY_ERROR',
          code: rawPrimary,
          message: prohibited.message
        });
        requiresReorder = true;
      }
    }

    // 3. Dagger/Asterisk Sequencing
    normalizedList.forEach((code, index) => {
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

    return { findings, suggestedPrimary, requiresReorder, normalizedList };
  }

  // Expose
  const target = (typeof self !== 'undefined') ? self : global;
  target.ClaimAiSequenceValidator = { validateCodingSequence, getProhibitedPrimaryReason };
})();
