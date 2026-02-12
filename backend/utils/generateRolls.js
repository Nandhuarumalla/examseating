// utils/generateRollNumbers.js

export function generateRollNumbers(start, end) {
  if (!start || !end) return [];

  // Extract PREFIX + SUFFIX
  const matchStart = start.match(/^(.*?)(\w{2})$/);
  const matchEnd = end.match(/^(.*?)(\w{2})$/);

  if (!matchStart || !matchEnd) return [];

  const prefix = matchStart[1];
  const startSfx = matchStart[2];
  const endSfx = matchEnd[2];

  // Safety: prefixes must match
  if (prefix !== matchEnd[1]) return [];

  const results = [];

  // Generate numeric suffixes (01–99)
  const generateNumeric = () => {
    let startNum = parseInt(startSfx, 10);
    if (isNaN(startNum)) return false; // Not numeric → skip

    for (let i = startNum; i <= 99; i++) {
      const suf = String(i).padStart(2, "0");
      results.push(prefix + suf);
      if (suf === endSfx) return true; // STOP
    }
    return false;
  };

  // Generate alphabetic A0–Z9
  const generateAlpha = () => {
    const startAlpha = /^[A-Z][0-9]$/.test(startSfx) ? startSfx[0] : "A";
    const startDigit = /^[A-Z][0-9]$/.test(startSfx) ? parseInt(startSfx[1], 10) : 0;

    let started = false;

    for (let ch = "A".charCodeAt(0); ch <= "Z".charCodeAt(0); ch++) {
      for (let num = 0; num <= 9; num++) {
        const suf = String.fromCharCode(ch) + num;

        // Start only when matching start suffix
        if (!started) {
          if (suf === startSfx || parseInt(startSfx, 10) <= 99) {
            // numeric ended → enter alphabetic stage
            started = true;
          } else continue;
        }

        results.push(prefix + suf);

        if (suf === endSfx) return true; // STOP
      }
    }
    return false;
  };

  // 1) try numeric first
  if (/^\d{2}$/.test(startSfx)) {
    if (generateNumeric()) return results;
    return generateAlpha() ? results : results;
  }

  // 2) otherwise start at alphabetic
  generateAlpha();
  return results;
}

export default generateRollNumbers;

