// Typo correction map for common user misspellings
const TYPO_MAP: Record<string, string> = {
  ihpone: "iphone",
  iphne: "iphone",
  ipone: "iphone",
  ifon: "iphone",
  iph: "iphone",
  aple: "apple",
  appl: "apple",
  samusng: "samsung",
  samsng: "samsung",
  samsumg: "samsung",
  glaxy: "galaxy",
  oneplsu: "oneplus",
  onplus: "oneplus",
  onepls: "oneplus",
  nord: "nord",
  pixle: "pixel",
  gogle: "google",
  redmi: "redmi",
  xiomi: "xiaomi",
  xomi: "xiaomi",
  motrola: "motorola",
  motora: "motorola",
  relame: "realme",
  reame: "realme",
  tanish: "tanishq",
  tanishk: "tanishq",
  spign: "spigen",
  ankr: "anker",
  macbok: "macbook",
  ipd: "ipad",
  earpod: "airpods",
  airpod: "airpods",
  watche: "watch",
  smartwatche: "smartwatch"
};

/**
 * Normalizes a single search token by fixing common typos
 */
export function normalizeSearchTerm(term: string): string {
  if (!term) return "";
  const cleaned = term.trim().toLowerCase();
  return TYPO_MAP[cleaned] || cleaned;
}

/**
 * Robust, typo-tolerant, multi-token search matcher for products.
 * Handles:
 * - Direct queries (e.g. "iPhone 17", "Samsung S26")
 * - Numeric model numbers (e.g. "17", "16", "26", "25", "450", "9")
 * - Typos (e.g. "ihpone 17", "samusng 26")
 * - Partial multi-keyword queries
 */
export function matchProductSearch(product: any, rawQuery: string): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;
  if (!product) return false;

  const rawLower = rawQuery.trim().toLowerCase();

  // Aggregate searchable product attributes
  const pName = (product.name || "").toLowerCase();
  const pBrand = (product.brand || "").toLowerCase();
  const pCat = (product.category || product.category_name || "").toLowerCase();
  const pSub = (product.sub_category || "").toLowerCase();
  const pDesc = (product.description || "").toLowerCase();
  const pSku = (product.sku || "").toLowerCase();
  const pUnit = (product.unit || "").toLowerCase();
  const pId = (product.id || "").toLowerCase();

  const fullText = `${pName} ${pBrand} ${pCat} ${pSub} ${pDesc} ${pSku} ${pUnit} ${pId}`;

  // 1. Direct whole substring match
  if (fullText.includes(rawLower)) {
    return true;
  }

  // 2. Tokenize the search query
  const rawTokens = rawLower.split(/[\s,_\-+]+/).filter(Boolean);
  if (rawTokens.length === 0) return true;

  const normalizedTokens = rawTokens.map(t => normalizeSearchTerm(t));

  // 3. Match each token
  const matchResults = normalizedTokens.map((tok) => {
    // If the token is pure numeric (e.g. "17", "16", "26", "15", "14", "9", "7"):
    if (/^\d+$/.test(tok)) {
      // Check if product text has this number as a distinct word or model indicator
      const wordMatch = new RegExp(`(^|[^0-9a-zA-Z])${tok}([^0-9a-zA-Z]|$)`, "i").test(fullText);
      if (wordMatch) return true;

      // Substring match in name or id
      if (pName.includes(tok) || pId.includes(tok) || pUnit.includes(tok)) return true;

      return false;
    }

    // Direct token substring match
    if (fullText.includes(tok)) return true;

    // Prefix/Suffix matching on words
    const words = fullText.split(/[\s,_\-+()|/]+/);
    return words.some(w => (w.length >= 3 && tok.length >= 3 && (w.startsWith(tok) || tok.startsWith(w))));
  });

  // If all tokens match
  if (matchResults.every(Boolean)) {
    return true;
  }

  // If multi-token query (e.g., "ihpone 17" or "apple 17 pro"), match if at least the main model/number matches
  const hasNumericToken = rawTokens.some(t => /^\d+$/.test(t));
  if (hasNumericToken) {
    const numericTokens = rawTokens.filter(t => /^\d+$/.test(t));
    const numMatches = numericTokens.every(nt => {
      const wordMatch = new RegExp(`(^|[^0-9a-zA-Z])${nt}([^0-9a-zA-Z]|$)`, "i").test(fullText);
      return wordMatch || pName.includes(nt) || pId.includes(nt);
    });

    if (numMatches) {
      // Also check if any non-numeric token matches or if it's the only query
      const nonNumeric = normalizedTokens.filter(t => !/^\d+$/.test(t));
      if (nonNumeric.length === 0) return true;
      const nonNumMatches = nonNumeric.some(t => fullText.includes(t));
      if (nonNumMatches) return true;
    }
  }

  return false;
}
