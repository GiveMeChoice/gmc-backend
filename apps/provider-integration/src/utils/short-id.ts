import { customAlphabet } from 'nanoid';

// no dashes or underscores
const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const nanoid = customAlphabet(alphabet, 10);

export function shortId(): string {
  return nanoid();
}
