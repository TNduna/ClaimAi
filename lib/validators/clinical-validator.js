// lib/validators/clinical-validator.js
(function () {
  function validateClinicalRules(codes, normalizedList, config = {}) {
    const findings = [];
    let suggestedPrimary = null;
    let requiresReorder = false;

    const hivCodes = (config.clinicalRules && config.clinicalRules.hivCodes) || ['B20', 'B21', 'B22', 'B23'];
    const blockedHiv = (config.clinicalRules && config.clinicalRules.blockedHivCodes) || ['B22.7'];
    const blockedNeoplasms = (config.clinicalRules && config.clinicalRules.blockedNeoplasms) || ['C97'];
    const tbActive = (config.clinicalRules && config.clinicalRules.tbActiveRange) || ['A15', 'A16', 'A17', 'A18', 'A19'];
    const tbResCategory = (config.clinicalRules && config.clinicalRules.tbResistanceCategory) || 'U50';
    const therapyCodes = (config.clinicalRules && config.clinicalRules.therapyCodes) || ['Z51.0', 'Z51.1'];
    const metastasisCodes = (config.clinicalRules && config.clinicalRules.metastasisCodes) || ['C77', 'C78', 'C79'];

    const hasHivCode = normalizedList.some(code => hivCodes.some(h => code.startsWith(h)));
    if (hasHivCode) {
      const hivIndex = normalizedList.findIndex(code => hivCodes.some(h => code.startsWith(h)));
      
      // B22.7 check
      if (normalizedList.some(code => blockedHiv.some(bh => code.startsWith(bh.replace('.', ''))))) {
        findings.push({
          type: 'CLINICAL_ERROR',
          code: codes[normalizedList.findIndex(code => blockedHiv.some(bh => code.startsWith(bh.replace('.', ''))))],
          message: 'Code B22.7 (HIV disease resulting in multiple diseases) is invalid in South Africa. Code each manifestation individually.'
        });
      }

      // HIV sequencing check
      if (hivIndex > 0) {
        const primaryCode = normalizedList[0];
        const isManifestation = /^(A\d{2}|B[0-8]\d|B9[0-4]|C\d{2}|D[0-4]\d|D[5-8]\d)/.test(primaryCode);
        if (isManifestation) {
          findings.push({
            type: 'CLINICAL_ERROR',
            code: codes[hivIndex],
            message: 'HIV code must be in the primary position (PDX) when sequenced with an HIV-related manifestation.'
          });
          requiresReorder = true;
          suggestedPrimary = codes[hivIndex];
        }
      } else {
        const primaryHiv = normalizedList[0];
        if (primaryHiv !== 'B206' && primaryHiv !== 'B230' && normalizedList.length === 1) {
          findings.push({
            type: 'CLINICAL_WARNING',
            code: codes[0],
            message: 'HIV code in primary position should be accompanied by at least one manifestation code in the secondary position to add specificity.'
          });
        }
      }
    }

    // TB active co-coding check
    const hasActiveTb = normalizedList.some(code => tbActive.some(tb => code.startsWith(tb)));
    const hasU50 = normalizedList.some(code => code.startsWith(tbResCategory));
    if (hasActiveTb && !hasU50) {
      findings.push({
        type: 'CLINICAL_GUIDANCE',
        message: 'For drug-resistant TB, ensure a code from category U50.- (MDR/XDR status) is co-coded in the secondary position if resistance is present.'
      });
    }

    // Neoplasm checks: C97 block
    if (normalizedList.some(code => blockedNeoplasms.some(bn => code.startsWith(bn)))) {
      findings.push({
        type: 'CLINICAL_ERROR',
        code: codes[normalizedList.findIndex(code => blockedNeoplasms.some(bn => code.startsWith(bn)))],
        message: 'Code C97 (Malignant neoplasms of independent multiple sites) is invalid in South Africa. Code each primary malignancy independently.'
      });
    }

    // Enforce Z51.0/Z51.1 as secondary
    const cleanTherapyCodes = therapyCodes.map(c => c.replace('.', ''));
    if (cleanTherapyCodes.includes(normalizedList[0])) {
      findings.push({
        type: 'CLINICAL_ERROR',
        code: codes[0],
        message: 'Chemotherapy or radiotherapy session codes (Z51.0, Z51.1) must be in a secondary position. The specific neoplasm code must be primary.'
      });
      requiresReorder = true;
      
      const neoIndex = normalizedList.findIndex(code => code.startsWith('C') || (code.startsWith('D') && !code.startsWith('D5') && !code.startsWith('D6') && !code.startsWith('D7') && !code.startsWith('D8')));
      if (neoIndex !== -1) {
        suggestedPrimary = codes[neoIndex];
      }
    }

    // Metastasis sequencing guide
    const isPrimaryMetastasis = metastasisCodes.some(mc => normalizedList[0] === mc || normalizedList[0].startsWith(mc));
    if (isPrimaryMetastasis) {
      const hasPrimaryNeoplasm = normalizedList.some(code => 
        (code.startsWith('C') && !metastasisCodes.some(mc => code.startsWith(mc))) || 
        code.startsWith('D0') || 
        code.startsWith('D3')
      );
      if (hasPrimaryNeoplasm) {
        findings.push({
          type: 'CLINICAL_GUIDANCE',
          message: 'A secondary metastasis code is in the primary position. Ensure this is intentional (e.g. admission is specifically for treatment of the metastasis rather than the primary neoplasm).'
        });
      }
    }

    return { findings, suggestedPrimary, requiresReorder };
  }

  // Expose
  const target = (typeof self !== 'undefined') ? self : global;
  target.ClaimAiClinicalValidator = { validateClinicalRules };
})();
