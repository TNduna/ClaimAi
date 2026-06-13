// scripts/preprocess-data.js
// Build-time preprocessing for ICD and PMB datasets.
const fs = require('fs');
const path = require('path');

function extractIcdi10IndexFromJs(jsPath) {
  const content = fs.readFileSync(jsPath, 'utf8');
  const m = content.match(/export\s+const\s+icd10Index\s*=\s*(\{[\s\S]*\});?/m);
  if (!m) throw new Error('icd10Index not found in ' + jsPath);
  return JSON.parse(m[1]);
}

function normalizePmb(raw) {
  // raw is an object keyed by possibly composite keys like "E11.5+I79.2*"
  const normalized = {};
  const normalizeKey = k => k.split('+')[0].trim().toUpperCase().replace(/\./g, '');
  for (const rawKey of Object.keys(raw)) {
    const base = normalizeKey(rawKey);
    if (!normalized[base]) normalized[base] = raw[rawKey];
  }
  return normalized;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

(function main(){
  try {
    const repoRoot = path.join(__dirname, '..');
    const icdJsPathCandidates = [
      path.join(repoRoot, 'ClaimAi', 'lib', 'icd10-index.js'),
      path.join(repoRoot, 'lib', 'icd10-index.js')
    ];

    let icdJsPath = icdJsPathCandidates.find(p => fs.existsSync(p));
    if (!icdJsPath) throw new Error('icd10-index.js not found in expected locations');

    console.log('Reading ICD JS from', icdJsPath);
    const icdIndex = extractIcdi10IndexFromJs(icdJsPath);

    const outDir = path.join(repoRoot, 'lib');
    ensureDir(outDir);
    const outJsonPath = path.join(outDir, 'icd10-index.json');
    fs.writeFileSync(outJsonPath, JSON.stringify(icdIndex));
    console.log('Wrote', outJsonPath, 'with', Object.keys(icdIndex).length, 'codes');

    const pmbRawPath = path.join(repoRoot, 'rules', 'pmb-linkages.json');
    if (!fs.existsSync(pmbRawPath)) {
      console.warn('PMB raw file not found at', pmbRawPath);
    } else {
      const raw = JSON.parse(fs.readFileSync(pmbRawPath, 'utf8'));
      const normalized = normalizePmb(raw);
      const outPmbPath = path.join(repoRoot, 'rules', 'pmb-normalized.json');
      fs.writeFileSync(outPmbPath, JSON.stringify(normalized, null, 2));
      console.log('Wrote', outPmbPath, 'with', Object.keys(normalized).length, 'normalized PMB entries');
    }

    console.log('Preprocessing complete.');
  } catch (err) {
    console.error('Preprocess failed:', err);
    process.exit(1);
  }
})();
