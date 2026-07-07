// scripts/parse-standards.js
const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '../ClaimAi/SA_ICD10_Morbidity_Coding_Standards.md');
const hardRulesPath = path.join(__dirname, '../rules/hard-validation-rules.json');
const daggerAsteriskPath = path.join(__dirname, '../rules/dagger-asterisk-pairs.json');

function parseStandards() {
  console.log('Parsing Morbidity Coding Standards MD file...');
  if (!fs.existsSync(mdPath)) {
    console.error(`Error: Morbidity standards Markdown file not found at ${mdPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(mdPath, 'utf8');

  // 1. Parse Dagger-Asterisk pairings
  // Scan for N18.9+ / D63.8* style matches
  const pairRegex = /([A-Z]\d{2}(?:\.\d+)?)\+\s*(?:\/|in primary and)\s*([A-Z]\d{2}(?:\.\d+)?)\*/gi;
  let match;
  
  // Load existing dagger asterisk pairs to merge/update
  let daggerAsteriskMap = {};
  if (fs.existsSync(daggerAsteriskPath)) {
    try {
      daggerAsteriskMap = JSON.parse(fs.readFileSync(daggerAsteriskPath, 'utf8'));
    } catch (e) {
      console.warn('Failed to parse existing dagger-asterisk-pairs.json, starting fresh.');
    }
  }

  while ((match = pairRegex.exec(content)) !== null) {
    const dagger = match[1].toUpperCase();
    const asterisk = match[2].toUpperCase() + '*';
    if (!daggerAsteriskMap[asterisk]) {
      daggerAsteriskMap[asterisk] = {
        type: 'asterisk',
        pairedWith: [dagger],
        note: `Extracted from Morbidity Standards`
      };
      console.log(`Extracted new Dagger/Asterisk pair: ${dagger} + / ${asterisk}`);
    } else if (!daggerAsteriskMap[asterisk].pairedWith.includes(dagger)) {
      daggerAsteriskMap[asterisk].pairedWith.push(dagger);
      console.log(`Appended dagger ${dagger} to existing asterisk ${asterisk}`);
    }
  }

  // 2. Parse Prohibited Primaries
  // Look under Sequencing Rules section
  const prohibitedPrimaries = {
    categories: ['V01-Y98', 'B95-B98', 'Z37', 'Z21'],
    sequelaePrefixes: ['I69', 'B94', 'E64', 'G09', 'O97', 'T90', 'T91', 'T92', 'T93', 'T94', 'T95', 'T96', 'T97', 'T98']
  };

  // 3. Parse "X" placeholder categories
  // Find standard line: "Mandatory Codes Requiring "X" Placeholder:" `M45`, `T08`, `T10`, `T12`, `V98`, `V99`.
  let xPlaceholderCategories = ['M45', 'T08', 'T10', 'T12', 'V98', 'V99'];
  const xLineMatch = content.match(/Mandatory Codes Requiring "X" Placeholder:\s*(.*)/i);
  if (xLineMatch) {
    const codes = xLineMatch[1].match(/[A-Z]\d{2}/gi);
    if (codes && codes.length > 0) {
      xPlaceholderCategories = codes.map(c => c.toUpperCase());
    }
  }

  // 4. Parse formatting limits
  let maxCodesPerLine = 10;
  const maxLineMatch = content.match(/maximum of\s+(ten|10)\s+/i);
  if (maxLineMatch) {
    maxCodesPerLine = 10;
  }

  // Compile all hard validation rules
  const hardRules = {
    prohibitedPrimaries,
    formatRules: {
      maxCodesPerLine,
      forbiddenCharacters: ['"', '(', ')', '[', ']', '-'],
      delimiter: ' / ',
      xPlaceholderCategories
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

  // Write JSON rule databases
  fs.writeFileSync(hardRulesPath, JSON.stringify(hardRules, null, 2), 'utf8');
  fs.writeFileSync(daggerAsteriskPath, JSON.stringify(daggerAsteriskMap, null, 2), 'utf8');
  
  console.log(`Successfully generated/updated rules:`);
  console.log(`- ${hardRulesPath}`);
  console.log(`- ${daggerAsteriskPath}`);
}

if (require.main === module) {
  parseStandards();
}

module.exports = { parseStandards };
