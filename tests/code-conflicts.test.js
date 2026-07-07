// tests/code-conflicts.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const conflictsPath = path.join(__dirname, '../lib/code-conflicts.js');
const conflictsCode = fs.readFileSync(conflictsPath, 'utf8');

const mockGlobal = {};
new Function('self', 'require', '__dirname', conflictsCode)(mockGlobal, require, path.join(__dirname, '../lib'));
const {
  validateCodingSequence,
  getProhibitedPrimaryReason,
  validateClaimLineFormat,
  generateSubmissionPreview,
  formatElectronicClaimsDelimiter
} = mockGlobal;

test('getProhibitedPrimaryReason identifies prohibited primaries', () => {
  // Prohibited primaries
  assert.ok(getProhibitedPrimaryReason('V01'), 'V01 is prohibited (External Cause)');
  assert.ok(getProhibitedPrimaryReason('Y98'), 'Y98 is prohibited (External Cause)');
  assert.ok(getProhibitedPrimaryReason('I69'), 'I69 is prohibited (Sequelae)');
  assert.ok(getProhibitedPrimaryReason('T90'), 'T90 is prohibited (Sequelae)');
  assert.ok(getProhibitedPrimaryReason('B95'), 'B95 is prohibited (Causative organism)');
  assert.ok(getProhibitedPrimaryReason('Z37'), 'Z37 is prohibited (Outcome of delivery)');
  assert.ok(getProhibitedPrimaryReason('Z21'), 'Z21 is prohibited (Asymptomatic HIV)');

  // Allowed primaries
  assert.strictEqual(getProhibitedPrimaryReason('E11'), null);
  assert.strictEqual(getProhibitedPrimaryReason('H36'), null);
  assert.strictEqual(getProhibitedPrimaryReason('B20'), null);
});

test('validateCodingSequence checks symbols', () => {
  const { findings } = validateCodingSequence(['E11.9+', '*H36.0']);
  assert.strictEqual(findings.length, 2, 'Two symbol warnings');
  assert.ok(findings[0].message.includes('dropped for electronic claims'));
});

test('validateCodingSequence flags prohibited primary', () => {
  const { findings, suggestedPrimary, requiresReorder } = validateCodingSequence(['V01', 'E11.9']);
  assert.strictEqual(findings.length, 1);
  assert.ok(findings[0].message.includes('External Cause Code'));
  assert.strictEqual(suggestedPrimary, 'E11.9', 'Auto-detects alternative primary');
  assert.strictEqual(requiresReorder, true);
});

test('validateCodingSequence validates Dagger/Asterisk pairs', () => {
  const daggerAsteriskPairs = {
    'H360': {
      pairedWith: ['E11'],
      note: 'Retinopathy in diabetes'
    }
  };

  // Correct order
  const res1 = validateCodingSequence(['E11.9', 'H36.0'], daggerAsteriskPairs);
  assert.strictEqual(res1.findings.length, 0, 'No errors for correct order');
  assert.strictEqual(res1.requiresReorder, false);

  // Incorrect order (Asterisk in primary position)
  const res2 = validateCodingSequence(['H36.0', 'E11.9'], daggerAsteriskPairs);
  assert.ok(res2.findings.some(f => f.type === 'SEQUENCE_ERROR'));
  assert.strictEqual(res2.suggestedPrimary, 'E11.9', 'Suggests swapping E11.9 to primary');

  // Missing pairing (no preceding E11)
  const res3 = validateCodingSequence(['A00.0', 'H36.0'], daggerAsteriskPairs);
  assert.ok(res3.findings.some(f => f.type === 'PAIRING_ERROR'));
});

test('formatElectronicClaimsDelimiter formats correctly', () => {
  assert.strictEqual(formatElectronicClaimsDelimiter('M79.20/I15.0'), 'M79.20 / I15.0');
  assert.strictEqual(formatElectronicClaimsDelimiter('M79.20-I15.0'), 'M79.20I15.0');
});

test('validateClaimLineFormat detects errors', () => {
  // Max 10 codes
  const manyCodes = Array(11).fill('E11.9');
  const res1 = validateClaimLineFormat('E11.9 '.repeat(11), manyCodes);
  assert.ok(res1.some(f => f.message.includes('Maximum of 10')));

  // Ditto characters
  const res2 = validateClaimLineFormat('E11.9 / "', ['E11.9', '"']);
  assert.ok(res2.some(f => f.message.includes('ditto characters')));

  // Delimiter issues
  const res3 = validateClaimLineFormat('E11.9/H36.0', ['E11.9', 'H36.0']);
  assert.ok(res3.some(f => f.message.includes('separated by exactly " / "')));

  // Brackets, hyphens, spaces
  const res4 = validateClaimLineFormat('E11-9 / (H36.0)', ['E11-9', '(H36.0)']);
  assert.ok(res4.some(f => f.message.includes('Hyphens are not allowed')));
  assert.ok(res4.some(f => f.message.includes('Brackets are not allowed')));

  // Dot rules (3-char vs extended)
  const res5 = validateClaimLineFormat('E11. / E119', ['E11.', 'E119']);
  assert.ok(res5.some(f => f.message.includes('3-character codes must exclude the dot')));
  assert.ok(res5.some(f => f.message.includes('Extended character codes must include the dot')));
});

test('generateSubmissionPreview formats clean output', () => {
  // Drop symbols, fix dots, correct delimiter
  const preview = generateSubmissionPreview(['E11.9+', '*H360', 'T16.']);
  assert.strictEqual(preview, 'E11.9 / H36.0 / T16');
});

test('validateCodingSequence handles HIV rules', () => {
  // HIV as secondary with manifestation as primary -> should trigger sequencing error & suggest primary swap
  const { findings, suggestedPrimary, requiresReorder } = validateCodingSequence(['A15.0', 'B20']);
  assert.ok(findings.some(f => f.message.includes('HIV code must be in the primary position')));
  assert.strictEqual(suggestedPrimary, 'B20');
  assert.strictEqual(requiresReorder, true);

  // B22.7 is blocked
  const res2 = validateCodingSequence(['B22.7']);
  assert.ok(res2.findings.some(f => f.message.includes('B22.7 (HIV disease resulting in multiple diseases) is invalid')));
});

test('validateCodingSequence handles TB rules', () => {
  // TB without U50 -> triggers guidance suggestion
  const { findings } = validateCodingSequence(['A15.0']);
  assert.ok(findings.some(f => f.message.includes('category U50.-')));
});

test('validateCodingSequence handles Neoplasm rules', () => {
  // Block C97
  const res1 = validateCodingSequence(['C97']);
  assert.ok(res1.findings.some(f => f.message.includes('Code C97 (Malignant neoplasms of independent multiple sites) is invalid')));

  // Enforce Z51 as secondary
  const res2 = validateCodingSequence(['Z51.1', 'C50.9']);
  assert.ok(res2.findings.some(f => f.message.includes('Z51.0, Z51.1) must be in a secondary position')));
  assert.strictEqual(res2.suggestedPrimary, 'C50.9');
});

test('validateClaimLineFormat checks specificity and X placeholder', () => {
  // M45 without X -> triggers SPECIFICITY_ERROR
  const res1 = validateClaimLineFormat('M45.99', ['M45.99']);
  assert.ok(res1.some(f => f.type === 'SPECIFICITY_ERROR' && f.message.includes("requires 'X' as the 4th character placeholder")));

  // M45 3-character -> triggers SPECIFICITY_WARNING
  const res2 = validateClaimLineFormat('M45', ['M45']);
  assert.ok(res2.some(f => f.type === 'SPECIFICITY_WARNING' && f.message.includes('requires a 5th character specificity')));

  // M45 correct -> no warning/error
  const res3 = validateClaimLineFormat('M45.X9', ['M45.X9']);
  assert.strictEqual(res3.length, 0);
});

test('validateClaimLineFormat checks inappropriate 5th character rejections', () => {
  // Trigger finger (M65.3) invalid 5th char -> SPECIFICITY_ERROR
  const res1 = validateClaimLineFormat('M65.30', ['M65.30']);
  assert.ok(res1.some(f => f.type === 'SPECIFICITY_ERROR' && f.message.includes('trigger finger')));

  // Trigger finger correct -> no error
  const res2 = validateClaimLineFormat('M65.34', ['M65.34']);
  assert.strictEqual(res2.length, 0);

  // M71.56 is invalid -> SPECIFICITY_ERROR
  const res3 = validateClaimLineFormat('M71.56', ['M71.56']);
  assert.ok(res3.some(f => f.type === 'SPECIFICITY_ERROR' && f.message.includes('M71.56 is invalid')));
});



