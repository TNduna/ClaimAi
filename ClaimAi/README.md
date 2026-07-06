# ClaimAi

ClaimAi is a Chrome extension designed to improve ICD-10 coding workflows for South African medical claims and scheme administrators. It validates ICD-10 codes in real time while users type, provides instant badge feedback, and displays rich side panel guidance for code lookup, PMB eligibility, and clinical rule checks.

## What it does

- Validates ICD-10 codes as users enter them into web forms, text fields, and contenteditable areas.
- Displays transient popup badges for:
  - valid ICD-10 codes
  - PMB-eligible codes
  - unknown / invalid codes
- Provides a side panel lookup experience with:
  - ICD-10 code descriptions
  - PMB eligibility and related guidance
  - dagger/asterisk pairing recommendations
  - age and gender warning rules
  - external cause code hints
- Supports lookup from selection context menu and live updates between the page and side panel.

## Key features

- **Real-time validation** using the latest CDC ICD-10-CM dataset.
- **PMB-aware lookup** that matches PMB rule entries against the ICD code dataset.
- **Side panel intelligence** with rules-based warnings and code recommendations.
- **Cross-site support** for Chrome-based websites via content script injection.
- **Clean, consistent dataset handling** from a single canonical `lib/icd10-index.js` file.

## Data sources

- `ClaimAi/data/icd10cm-codes-April-1-2026.txt`
  - Source file used to generate the ICD index.
- `ClaimAi/lib/icd10-index.js`
  - Generated JavaScript index of ICD-10 codes for runtime use.
- `rules/pmb-linkages.json`
  - PMB eligibility and linkage metadata.
- `rules/dagger-asterisk-pairs.json`
  - Asterisk and dagger pairing guidance.
- `rules/age-gender-rules.json`
  - Code age and gender suitability checks.
- `rules/external-cause-rules.json`
  - External cause recommendations for injury codes.

## Installation

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `claimai-extension` project folder.
5. Reload the extension after code changes.

## Development

- Regenerate the ICD index after updating source data:

```bash
cd ClaimAi
node convert-icd.js
```

- The generated output writes to `lib/icd10-index.js` and is the canonical dataset used by both the content script and side panel.

## File overview

- `manifest.json` — extension metadata, permissions, content scripts, and side panel registration.
- `background.js` — registers the context menu and forwards lookup requests to the side panel.
- `content.js` — monitors page inputs, validates ICD codes, and displays popup badges.
- `sidepanel.html` — side panel UI shell.
- `sidepanel.js` — side panel logic, data loading, and display of code details.
- `inject.css` — shared badge styling and injected UI styles.

## Troubleshooting

- If lookups stop working after updating data, regenerate the index and reload the extension.
- Confirm `lib/icd10-index.js` exists and contains the latest `export const icd10Index = { ... }` object.
- Use browser devtools console to inspect `ClaimAi` logs from `background.js`, `content.js`, and `sidepanel.js`.

## Notes

- The extension now uses a single canonical ICD index location (`lib/icd10-index.js`) to avoid stale import paths.
- PMB-only codes are treated as valid and synced across popups, side panel display, and live update flows.
- The live update path between content script and side panel is intentionally logged to help confirm message delivery during testing.
