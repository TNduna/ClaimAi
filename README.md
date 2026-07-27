# ClaimAi - Intelligent ICD-10 Coding Assistant

ClaimAi is a privacy-first, high-performance Chrome extension designed to streamline clinical coding workflows for South African medical schemes, billers, and scheme administrators.

It validates ICD-10 codes in real-time as users type, provides instant visual feedback, checks PMB eligibility, alerts on demographic mismatches, and warns against high-risk billing combinations.

---

## Key Features

1. **Real-Time Validation**: Parses and matches inputs against the complete South African ICD-10 clinical classification database.
2. **PMB (Prescribed Minimum Benefits) Identification**: Flags PMB-eligible conditions instantly to ensure correct scheme funding and billing.
3. **Demographic Rules Validation**: Evaluates patient age and gender against diagnostic constraints to prevent demographic coding mismatches.
4. **Clinical Rule Audits & Morbidity Standards**: Fully complies with South African Morbidity Coding Standards:
   - **Prohibited Primary Diagnoses (GSN0001/GSN0002)**: Flags invalid primary diagnoses such as External Causes (V01-Y98), Causative Agents (B95-B98), Outcomes of Delivery (Z37), Asymptomatic HIV Status (Z21), and Sequelae (I69).
   - **Specificity & X Placeholders (GSN0009)**: Ensures required 5th-character specificity on categories like M45, T08, T10, T12, V98, and V99, and enforces 'X' as the 4th character placeholder.
   - **Inappropriate 5th Character Rejections (GSN0011)**: Rejects anatomical specificity mismatches (e.g. trigger finger M65.3 requiring hand subdivision `4`, or invalid bursitis codes like M71.56).
   - **HIV / AIDS Rules (DSN0101)**: Enforces HIV codes in the primary position when coded alongside manifestations, and flags invalid clinical codes (e.g., B22.7).
   - **Neoplasms & Therapy Sequencing (DSN0201)**: Rejects multiple site combination codes like C97 and ensures radiotherapy/chemotherapy session codes (Z51.0, Z51.1) are positioned secondarily.
   - **Tuberculosis Drug Resistance (DSN2201)**: Reminds coders to include drug resistance status (category U50.-) when active TB is coded.
5. **Strict Claim Line Formatting (GSN0103/4/5)**:
   - Enforces a maximum of 10 codes per claim line.
   - Flags forbidden ditto characters (`"`) and incorrect delimiters (requires exactly ` / ` spacing).
   - Blocks brackets `()` and hyphens `-`.
   - Enforces dot rules (3-character codes must exclude the dot, while extended codes must include it).
6. **DOM Framework Compatibility**: Support for React, Shadow DOM web components, contenteditable rich editors, and iframe inputs. Employs MutationObservers to prevent frameworks from wiping injected badges.
7. **Privacy First**: Operates entirely client-side via IndexedDB. No clinical details, PII, or PHI are sent over the network, ensuring compliance with **POPIA** and **HIPAA**.

---

## Installation & Setup (Developer/Beta Mode)

Since ClaimAi is currently in beta, you can load it as an unpacked extension:

1. **Download/Clone** this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the folder containing this codebase (`claimai-extension`).
6. Open the Chrome Extension panel, pin **ClaimAi**, and click it to open the side panel.

### Granting Site Access (Optional Permissions)
To respect user privacy, the extension does not run on all websites by default. 
When navigating to your medical billing portal:
1. Open the **ClaimAi** sidepanel.
2. If the site is not permitted yet, an orange **Permission Required** banner will appear.
3. Click **Enable ClaimAi** to grant access. The page will reload and live code validation will activate.

---

## Codebase Architecture

```
claimai-extension/
├── .github/workflows/
│   └── release.yml                 # Automated release packaging pipeline
├── ClaimAi/
│   └── SA_ICD10_Morbidity_Coding_Standards.md  # Official compliance reference
├── ICD-10-CM/
│   └── diagnosis_codes.json        # Source ICD-10 reference dataset
├── lib/
│   ├── validators/                 # Centralized validation engines
│   │   ├── clinical-validator.js   # Age, gender, and clinical rules validator
│   │   ├── format-validator.js     # Delimiter, ditto character, and bracket formats
│   │   ├── sequence-validator.js   # Sequencing rules (HIV, Neoplasms, TB resistance)
│   │   └── specificity-validator.js# 5th-character specificity checks
│   ├── bookmarks.js                # Code bookmarking controller
│   ├── code-conflicts.js           # Conflict resolution and diagnostic logic
│   ├── db.js                       # IndexedDB wrapper and schema migration coordinator
│   ├── icd10-index.js              # In-memory ICD indexing library
│   ├── icd10-index.json            # Compressed ICD-10 index for fast seeding
│   ├── id-parser.js                # South African ID gender/birthdate validator
│   ├── load-icd-data.js            # Initial dataset loader
│   ├── scheme-rules.js             # Scheme rules loader
│   └── telemetry.js                # POPIA-compliant, local telemetry aggregator
├── rules/
│   ├── age-gender-rules.json       # Clinical age/gender constraints
│   ├── dagger-asterisk-pairs.json  # Dual coding pairings index
│   ├── external-cause-rules.json   # Traumatology external cause rule definitions
│   ├── high-risk-pairs.json        # Conflicting/duplicate code pairs
│   └── pmb-linkages.json           # Prescribed Minimum Benefit linkages
├── tests/
│   ├── code-conflicts.test.js      # Testing suite for clinical validators
│   ├── manual_test.html            # Web sandbox testing inputs, iframes, and Shadow DOM
│   ├── morbidity-standards-coverage.test.js # Verifies compliance with SA Morbidity Standards
│   └── utils.test.js               # Test suite for telemetry and parsing utilities
├── background.js                   # Service worker, manages DB init and proxy queries
├── content.js                      # Content script, parses page input and injects badges
├── inject.css                      # Styling for in-page visual badges
├── manifest.json                   # Chrome extension MV3 manifest declarations
├── popup.html / popup.js           # Lightweight action popup UI and metrics
├── sidepanel.html / sidepanel.js   # Rich coding assistant sidebar
├── sidepanel.css                   # Premium sidepanel styling and transitions
└── SECURITY.md                     # Data compliance and POPIA/HIPAA guidelines
```

---

## Release Pipeline & Updates

### Extension Updates
For store deployments, Google Chrome handles extension updates automatically using the manifest's native mechanism. Extensions loaded in developer mode must be updated manually by clicking the **Reload** (circular arrow) icon on `chrome://extensions/`.

### Packaging Releases
When pushing code changes to GitHub:
1. Update `"version"` inside `manifest.json`.
2. Commit and push a tag matching the semantic versioning format (e.g. `v1.0.1`):
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
3. The GitHub Actions release workflow will trigger automatically to bundle the extension files into a zip package (`claimai-extension.zip`) and attach it to a draft release on your GitHub repository.
