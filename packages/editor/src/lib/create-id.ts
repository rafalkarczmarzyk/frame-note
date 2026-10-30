/** getRandomValues also works when the app is opened over plain HTTP on a LAN. */
export function createId() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), (part) =>
    part.toString(16).padStart(8, '0'),
  ).join('');
}
