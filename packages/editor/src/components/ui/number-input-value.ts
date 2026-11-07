/** Adjust by steps, then round to the step's decimal precision (not its grid). */
export function adjustNumberInput(
  value: number,
  steps: number,
  step: number | 'any',
  min: number,
  max: number,
): number {
  const increment = step === 'any' ? 1 : step;
  const [coefficient = '', exponent = '0'] = String(increment).split('e');
  const decimals = Math.max(
    0,
    (coefficient.split('.')[1]?.length ?? 0) - Number(exponent),
  );
  const next = value + steps * increment;
  const rounded = Number(next.toFixed(step === 'any' ? 6 : decimals));
  return Math.min(max, Math.max(min, rounded));
}
