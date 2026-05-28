// lib/load-icd-data.js
export async function loadICD10Index() {
  try {
    console.log("🔄 Loading ICD-10 hierarchical data...");

    const response = await fetch(chrome.runtime.getURL('ICD-10-CM/diagnosis_codes.json'));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const index = {};
    let count = 0;

    function traverse(node) {
      if (!node) return;

      const code = (node.code || '').toString().trim().toUpperCase();
      if (code && code.length >= 3) {
        index[code] = {
          d: node.desc_full || node.desc || "No description",
          c: ""
        };
        count++;
      }

      // Recurse into children
      if (Array.isArray(node.children)) {
        node.children.forEach(child => traverse(child));
      }
    }

    // Start traversal from root
    data.forEach(root => traverse(root));

    console.log(`✅ Successfully loaded ${count} ICD-10 codes from hierarchical structure!`);
    return index;

  } catch (err) {
    console.error("❌ Failed to load ICD data:", err);
    return {};
  }
}
