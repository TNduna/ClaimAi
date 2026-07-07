// lib/code-conflicts.js (classic script)
(function () {
  // If running in Node.js (test runner), load the sub-validators from the filesystem
  const isNode = typeof process !== 'undefined' && process.release && process.release.name === 'node';
  if (isNode) {
    const fs = require('fs');
    const path = require('path');
    const loadSubValidator = (filename) => {
      const filePath = path.join(__dirname, 'validators', filename);
      const code = fs.readFileSync(filePath, 'utf8');
      new Function('self', code)(global);
    };
    loadSubValidator('format-validator.js');
    loadSubValidator('sequence-validator.js');
    loadSubValidator('clinical-validator.js');
    loadSubValidator('specificity-validator.js');
  }

  // Default fallback configuration profile (v6-2014)
  const defaultConfig = {
    prohibitedPrimaries: {
      categories: ['V01-Y98', 'B95-B98', 'Z37', 'Z21'],
      sequelaePrefixes: ['I69', 'B94', 'E64', 'G09', 'O97', 'T90', 'T91', 'T92', 'T93', 'T94', 'T95', 'T96', 'T97', 'T98']
    },
    formatRules: {
      maxCodesPerLine: 10,
      forbiddenCharacters: ['"', '(', ')', '[', ']', '-'],
      delimiter: ' / ',
      xPlaceholderCategories: ['M45', 'T08', 'T10', 'T12', 'V98', 'V99']
    },
    clinicalRules: {
      hivCodes: ['B20', 'B21', 'B22', 'B23'],
      blockedHivCodes: ['B22.7'],
      blockedNeoplasms: ['C97'],
      tbActiveRange: ['A15', 'A16', 'A17', 'A18', 'A19'],
      tbResistanceCategory: 'U50',
      therapyCodes: ['Z51.0', 'Z51.1'],
      metastasisCodes: ['C77', 'C78', 'C79']
    }
  };

  /**
   * Evaluates if a normalized code is prohibited in the primary diagnosis position.
   */
  function getProhibitedPrimaryReason(normalizedCode, config = defaultConfig) {
    if (typeof ClaimAiSequenceValidator === 'undefined') return null;
    return ClaimAiSequenceValidator.getProhibitedPrimaryReason(normalizedCode, config);
  }

  /**
   * Validates coding sequencing, primary diagnosis criteria, and dagger/asterisk pairings.
   */
  function validateCodingSequence(codes, daggerAsteriskPairs = {}, config = defaultConfig) {
    if (typeof ClaimAiSequenceValidator === 'undefined' || typeof ClaimAiClinicalValidator === 'undefined') {
      return { findings: [], suggestedPrimary: null, requiresReorder: false };
    }

    // 1. Run sequencing and prohibited primary validations
    const seqResult = ClaimAiSequenceValidator.validateCodingSequence(codes, daggerAsteriskPairs, config);
    
    // 2. Run clinical validations
    const clinResult = ClaimAiClinicalValidator.validateClinicalRules(codes, seqResult.normalizedList || [], config);

    // Merge validation alerts
    const mergedFindings = [...seqResult.findings, ...clinResult.findings];
    const requiresReorder = seqResult.requiresReorder || clinResult.requiresReorder;
    const suggestedPrimary = seqResult.suggestedPrimary || clinResult.suggestedPrimary;

    // 3. Auto-suggest engine: find a compliant primary diagnosis candidate
    let finalSuggested = suggestedPrimary;
    if ((requiresReorder || !codes[0]) && !finalSuggested && seqResult.normalizedList) {
      const candidateIndex = seqResult.normalizedList.findIndex((code) => {
        const isAst = !!(daggerAsteriskPairs && daggerAsteriskPairs[code]);
        return !getProhibitedPrimaryReason(code, config) && !isAst;
      });
      if (candidateIndex !== -1) {
        finalSuggested = codes[candidateIndex];
      }
    }

    return {
      findings: mergedFindings,
      suggestedPrimary: finalSuggested,
      requiresReorder
    };
  }

  /**
   * Validates raw claim line formatting, delimiting, dots, and specificity options.
   */
  function validateClaimLineFormat(rawInput, parsedCodes, config = defaultConfig) {
    if (typeof ClaimAiFormatValidator === 'undefined' || typeof ClaimAiSpecificityValidator === 'undefined') {
      return [];
    }

    // 1. Run format and delimiter checks
    const findings = ClaimAiFormatValidator.validateClaimLineFormat(rawInput, parsedCodes, config);

    // 2. Run specificity checks for each code
    parsedCodes.forEach(code => {
      const clean = code.trim().toUpperCase();
      ClaimAiSpecificityValidator.validateSpecificity(clean, code, findings, config);
    });

    return findings;
  }

  /**
   * Generates clean electronic submission preview.
   */
  function generateSubmissionPreview(parsedCodes, config = defaultConfig) {
    if (!Array.isArray(parsedCodes) || parsedCodes.length === 0) return '';
    const delimiter = (config.formatRules && config.formatRules.delimiter) || ' / ';
    
    const cleanedCodes = parsedCodes.slice(0, 10).map(code => {
      let clean = code.toUpperCase().replace(/[\+\*\s\(\)\[\]\-\"]/g, '');
      const base = clean.replace(/\./g, '');
      
      if (base.length === 3) {
        return base;
      } else if (base.length > 3) {
        return `${base.slice(0, 3)}.${base.slice(3)}`;
      }
      return clean;
    });

    return cleanedCodes.join(delimiter);
  }

  /**
   * Standardizes raw delimiters to CODE_/_CODE.
   */
  function formatElectronicClaimsDelimiter(rawInputString) {
    if (typeof rawInputString !== 'string') return rawInputString;
    return rawInputString.toUpperCase()
      .replace(/[\-\s]+/g, '')
      .replace(/\/+/g, ' / ');
  }

  // Export symbols to global context
  const target = (typeof self !== 'undefined') ? self : (typeof global !== 'undefined' ? global : this);
  target.getProhibitedPrimaryReason = getProhibitedPrimaryReason;
  target.validateCodingSequence = validateCodingSequence;
  target.validateClaimLineFormat = validateClaimLineFormat;
  target.generateSubmissionPreview = generateSubmissionPreview;
  target.formatElectronicClaimsDelimiter = formatElectronicClaimsDelimiter;
})();
