// tests/morbidity-standards-coverage.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Initialize the sandbox engine context
const conflictsPath = path.join(__dirname, '../lib/code-conflicts.js');
const conflictsCode = fs.readFileSync(conflictsPath, 'utf8');

const mockGlobal = {};
new Function('self', 'require', '__dirname', conflictsCode)(mockGlobal, require, path.join(__dirname, '../lib'));

const {
  validateCodingSequence,
  validateClaimLineFormat,
  generateSubmissionPreview,
  getProhibitedPrimaryReason
} = mockGlobal;

const mdPath = path.join(__dirname, '../ClaimAi/SA_ICD10_Morbidity_Coding_Standards.md');

test('standards Markdown file exists and contains core GSN/DSN rules', () => {
  assert.ok(fs.existsSync(mdPath), 'Morbidity standards Markdown file must exist');
  const content = fs.readFileSync(mdPath, 'utf8');

  // Verify key standard IDs are present in the text documentation
  const expectedStandards = [
    'GSN0001', 'GSN0002', 'GSN0006', 'GSN0009', 'GSN0010', 'GSN0011',
    'GSN0103', 'GSN0104', 'GSN0105', 'DSN0101', 'DSN0201', 'DSN2201'
  ];

  expectedStandards.forEach(std => {
    assert.ok(content.includes(std), `Markdown document must document standard: ${std}`);
  });
});

test('GSN0001/GSN0002: Prohibited Primary Diagnosis coverage', () => {
  // External Cause (V01-Y98) as Primary
  const vCode = getProhibitedPrimaryReason('V01.9');
  assert.ok(vCode && vCode.message.includes('External Cause'), 'V01.9 must be flagged as prohibited primary');

  // Causative Organisms (B95-B98) as Primary
  const bCode = getProhibitedPrimaryReason('B95.6');
  assert.ok(bCode && bCode.message.includes('causative agent organism'), 'B95.6 must be flagged as prohibited primary');

  // Outcome of Delivery (Z37) as Primary
  const z37Code = getProhibitedPrimaryReason('Z37.0');
  assert.ok(z37Code && z37Code.message.includes('Outcome of delivery'), 'Z37.0 must be flagged as prohibited primary');

  // Asymptomatic HIV Status (Z21) as Primary
  const z21Code = getProhibitedPrimaryReason('Z21');
  assert.ok(z21Code && z21Code.message.includes('Asymptomatic HIV'), 'Z21 must be flagged as prohibited primary');

  // Sequelae (I69) as Primary
  const i69Code = getProhibitedPrimaryReason('I69.4');
  assert.ok(i69Code && i69Code.message.includes('Sequelae'), 'I69.4 must be flagged as prohibited primary');
});

test('GSN0009: Specificity and X Placeholders coverage', () => {
  const xCategories = ['M45', 'T08', 'T10', 'T12', 'V98', 'V99'];

  xCategories.forEach(cat => {
    // 3-char format warning
    const resWarning = validateClaimLineFormat(cat, [cat]);
    assert.ok(resWarning.some(f => f.type === 'SPECIFICITY_WARNING' && f.message.includes('requires a 5th character specificity')), `${cat} must warn when 3-char`);

    // Inappropriate 4th character placeholder error
    const invalid5Char = `${cat}.12`;
    const resError = validateClaimLineFormat(invalid5Char, [invalid5Char]);
    assert.ok(resError.some(f => f.type === 'SPECIFICITY_ERROR' && f.message.includes("requires 'X' as the 4th character placeholder")), `${invalid5Char} must fail specificity`);

    // Valid X-placeholder format
    const valid5Char = `${cat}.X2`;
    const resValid = validateClaimLineFormat(valid5Char, [valid5Char]);
    const errors = resValid.filter(f => f.type.startsWith('SPECIFICITY'));
    assert.strictEqual(errors.length, 0, `${valid5Char} should be valid`);
  });
});

test('GSN0011: Inappropriate 5th character rejections coverage', () => {
  // Trigger finger (M65.3) must have 5th char = 4 (Hand)
  const invalidTrigger = validateClaimLineFormat('M65.31', ['M65.31']);
  assert.ok(invalidTrigger.some(f => f.type === 'SPECIFICITY_ERROR' && f.message.includes('trigger finger')));

  const validTrigger = validateClaimLineFormat('M65.34', ['M65.34']);
  assert.strictEqual(validTrigger.filter(f => f.type === 'SPECIFICITY_ERROR').length, 0);

  // M71.56 bursitis is invalid in SA, must use M70.56
  const invalidBursitis = validateClaimLineFormat('M71.56', ['M71.56']);
  assert.ok(invalidBursitis.some(f => f.type === 'SPECIFICITY_ERROR' && f.message.includes('M71.56 is invalid')));
});

test('GSN0103/4/5: Claim line formatting and delimiter coverage', () => {
  // Max 10 codes per claim line item
  const tooManyCodes = Array(11).fill('E11.9');
  const resMax = validateClaimLineFormat('E11.9 '.repeat(11), tooManyCodes);
  assert.ok(resMax.some(f => f.message.includes('Maximum of 10')));

  // Ditto character block
  const resDitto = validateClaimLineFormat('E11.9 / "', ['E11.9', '"']);
  assert.ok(resDitto.some(f => f.message.includes('ditto characters')));

  // Electronic claim delimiter formatting
  const resDelimiter = validateClaimLineFormat('E11.9/H36.0', ['E11.9', 'H36.0']);
  assert.ok(resDelimiter.some(f => f.message.includes('separated by exactly " / "')));

  // Forbidden characters (brackets, hyphens)
  const resChars = validateClaimLineFormat('(E11-9) / H36.0', ['(E11-9)', 'H36.0']);
  assert.ok(resChars.some(f => f.message.includes('Brackets are not allowed')));
  assert.ok(resChars.some(f => f.message.includes('Hyphens are not allowed')));

  // Dot rules (3-char vs extended)
  const resDots = validateClaimLineFormat('E11. / E119', ['E11.', 'E119']);
  assert.ok(resDots.some(f => f.message.includes('3-character codes must exclude the dot')));
  assert.ok(resDots.some(f => f.message.includes('Extended character codes must include the dot')));
});

test('DSN0101: HIV / AIDS Clinical rules coverage', () => {
  // HIV as secondary with manifestation as primary -> should trigger sequencing error & suggest primary swap
  const { findings, suggestedPrimary, requiresReorder } = validateCodingSequence(['A15.0', 'B20']);
  assert.ok(findings.some(f => f.message.includes('HIV code must be in the primary position')));
  assert.strictEqual(suggestedPrimary, 'B20');
  assert.strictEqual(requiresReorder, true);

  // B22.7 is explicitly excluded from SA context
  const resB227 = validateCodingSequence(['B22.7']);
  assert.ok(resB227.findings.some(f => f.message.includes('B22.7 (HIV disease resulting in multiple diseases) is invalid')));
});

test('DSN0201: Neoplasms and Therapy Sequencing coverage', () => {
  // Neoplasms: Block C97 (multiple sites combination code)
  const resC97 = validateCodingSequence(['C97']);
  assert.ok(resC97.findings.some(f => f.message.includes('Code C97 (Malignant neoplasms of independent multiple sites) is invalid')));

  // Enforce Z51.0/Z51.1 therapy sessions as secondary position
  const resZ51 = validateCodingSequence(['Z51.1', 'C50.9']);
  assert.ok(resZ51.findings.some(f => f.message.includes('Z51.0, Z51.1) must be in a secondary position')));
  assert.strictEqual(resZ51.suggestedPrimary, 'C50.9');
});

test('DSN2201: Tuberculosis Drug Resistance guidelines coverage', () => {
  // Active TB category without MDR/XDR U50 category should warn coder
  const resTb = validateCodingSequence(['A15.0']);
  assert.ok(resTb.findings.some(f => f.message.includes('category U50.-')));
});
