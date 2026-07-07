// lib/validators/specificity-validator.js
(function () {
  function validateSpecificity(cleanCode, rawCode, findings, config = {}) {
    const xRequiredCategories = (config.formatRules && config.formatRules.xPlaceholderCategories) || ['M45', 'T08', 'T10', 'T12', 'V98', 'V99'];

    const baseCode = cleanCode.replace(/[\+\*\.]/g, '');

    // 5. Specificity & "X" Placeholder Rules (GSN0009)
    const prefix3 = baseCode.substring(0, 3);
    if (xRequiredCategories.includes(prefix3)) {
      if (baseCode.length === 3) {
        findings.push({
          type: 'SPECIFICITY_WARNING',
          code: cleanCode,
          message: `Category ${prefix3} requires a 5th character specificity with an 'X' placeholder (e.g. ${prefix3}.X9).`
        });
      } else if (baseCode.length > 3) {
        if (baseCode[3] !== 'X') {
          findings.push({
            type: 'SPECIFICITY_ERROR',
            code: cleanCode,
            message: `Category ${prefix3} requires 'X' as the 4th character placeholder (found '${baseCode[3]}' instead of 'X').`
          });
        }
      }
    }

    // 6. Inappropriate 5th Character Rejections (GSN0011)
    if (baseCode.startsWith('M653')) {
      if (baseCode.length === 5 && baseCode[4] !== '4') {
        findings.push({
          type: 'SPECIFICITY_ERROR',
          code: cleanCode,
          message: `Inappropriate 5th character for trigger finger (${cleanCode}). The 5th character must be 4 (Hand), i.e. M65.34.`
        });
      }
    }
    if (baseCode === 'M7156') {
      findings.push({
        type: 'SPECIFICITY_ERROR',
        code: cleanCode,
        message: 'Code M71.56 is invalid. Other bursitis of knee/lower leg must be coded to M70.56.'
      });
    }
  }

  // Expose
  const target = (typeof self !== 'undefined') ? self : global;
  target.ClaimAiSpecificityValidator = { validateSpecificity };
})();
