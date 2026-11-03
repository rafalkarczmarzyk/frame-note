export function usedTokens(template: string): Set<string> {
  return new Set(
    Array.from(template.matchAll(/\{([^{}]+)\}/gu), (match) => match[1]!),
  );
}
