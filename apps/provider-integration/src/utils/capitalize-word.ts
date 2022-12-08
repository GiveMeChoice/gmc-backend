export function capitalizeWord(word: string): string {
  return word
    .split('')
    .map((l, i) => (i === 0 ? l.toUpperCase() : l))
    .join('');
}
