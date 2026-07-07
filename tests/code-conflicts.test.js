// tests/code-conflicts.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const conflictsPath = path.join(__dirname, '../lib/code-conflicts.js');
const conflictsCode = fs.readFileSync(conflictsPath, 'utf8');

const mockGlobal = {};
new Function('self', conflictsCode)(mockGlobal);
const { validateCodingSequence, getProhibitedPrimaryReason, formatElectronicClaimsDelimiter } = mockGlobal;

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
