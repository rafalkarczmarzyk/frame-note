/** UI percentage to browser encoder quality. Never let out-of-range values
 * silently select the browser's default JPEG quality. */
export function jpegQuality(percent: number): number {
  if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
    throw new Error('JPEG quality must be an integer from 1 to 100.');
  }
  return percent / 100;
}
