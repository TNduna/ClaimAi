// convert-icd.js
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'data', 'icd10cm-codes-April-1-2026.txt');
const outputPath = path.join(__dirname, '..', 'lib', 'icd10-index.js');

console.log("Reading file from:", inputPath);
console.log("Writing output to:", outputPath);

const content = fs.readFileSync(inputPath, 'utf-8');
const lines = content.split('\n');

const icdIndex = {};

let count = 0;

lines.forEach(line => {
  if (line.length < 10) return;

  const codePart = line.substring(0, 7).trim();
  const description = line.substring(8).trim();

  if (codePart && description) {
    icdIndex[codePart] = { d: description };
    count++;

    // Also add version with dot (e.g. A00.0)
    if (codePart.length >= 4 && codePart[3] !== '.') {
      const withDot = codePart.substring(0, 3) + '.' + codePart.substring(3);
      icdIndex[withDot] = { d: description };
    }
  }
});

const outputContent = `// Auto-generated from CDC ICD-10-CM 2026
export const icd10Index = ${JSON.stringify(icdIndex, null, 2)};

console.log('✅ Loaded ${count} ICD-10 codes from official CDC 2026 source');
`;

fs.writeFileSync(outputPath, outputContent);

console.log(`🎉 Success! Created ${outputPath} with ${count} codes`);
