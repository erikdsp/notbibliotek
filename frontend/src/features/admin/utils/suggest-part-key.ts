export function suggestPartKey(filename: string) {
  const name = filename
    .replace(/\.pdf$/i, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const matches = [
    { pattern: /\bviolin\s*(?:i|1)\b/, key: "violin1" },
    { pattern: /\bviolin\s*(?:ii|2)\b/, key: "violin2" },
    { pattern: /\bviolin\b/, key: "violin" },
    { pattern: /\bviola\b/, key: "viola" },
    { pattern: /\bcello\b/, key: "cello" },
    { pattern: /\bflute\b/, key: "flute" },
    { pattern: /\bclarinet\b/, key: "clarinet" },
  ];

  return matches.find(({ pattern }) => pattern.test(name))?.key ?? "";
}