export function nameToKey(name: string, existingKeys: Set<string>) {
  const baseKey = name.replace(/\s+/g, "").toLowerCase();

  let key = baseKey;
  let number = 2;

  while (existingKeys.has(key)) {
    key = `${baseKey}-${number++}`;
  }

  return key;
}