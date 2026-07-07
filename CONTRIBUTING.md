# Contributing Guidelines: Updating Morbidity Coding Standards

ClaimAi uses a **Single Source of Truth** model where all clinical validation rules, formatting limits, and diagnostic exclusions are driven by the documentation in [SA_ICD10_Morbidity_Coding_Standards.md](file:///c:/Users/tshep/OneDrive/Documents/claimai-extension/ClaimAi/SA_ICD10_Morbidity_Coding_Standards.md).

Follow the steps below to update or modify coding standards.

---

## 1. Edit the Coding Standards File
Open and edit [SA_ICD10_Morbidity_Coding_Standards.md](file:///c:/Users/tshep/OneDrive/Documents/claimai-extension/ClaimAi/SA_ICD10_Morbidity_Coding_Standards.md).

- **Rule IDs:** Ensure rules are clearly demarcated under headers with GSN (General Standard National) or DSN (Diagnosis Standard National) identifiers (e.g. `GSN0009` or `DSN0101`).
- **Dagger/Asterisk Pairs:** Format dagger/asterisk pairings on their own lines using the syntax `CODE+ / CODE* (Description)` (e.g. `N18.9+ / D63.8*`). The compiler script will automatically parse and index them.
- **X Placeholders:** List mandatory placeholder categories in backticks (e.g., `` `M45` ``, `` `T08` ``).

## 2. Compile Rules and Configs
Once you have modified the Markdown standards document, run the rules compiler to update the database configuration profiles:

```bash
npm run parse-rules
```

This updates:
- `rules/hard-validation-rules.json` (format rules, clinical limits, prohibited lists)
- `rules/dagger-asterisk-pairs.json` (compiled dagger/asterisk mappings)

## 3. Verify Changes
Run the automated test runner to ensure compatibility, correctness, and coverage of all morbidity standards:

```bash
npm test
```

Make sure all tests pass without errors before committing. If you added a new standard, append appropriate test cases in [tests/morbidity-standards-coverage.test.js](file:///c:/Users/tshep/OneDrive/Documents/claimai-extension/tests/morbidity-standards-coverage.test.js).
