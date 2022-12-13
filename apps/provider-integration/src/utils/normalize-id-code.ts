export function normalizeIdCode(raw: string): string {
  return raw
    .toLowerCase() // lowercase only
    .replace(/\s+/g, '-') // spaces -> dashes
    .replace(/[^a-zA-Z0-9 -]/g, '') // remove non-alphanumeric
    .trim(); // trim
}
