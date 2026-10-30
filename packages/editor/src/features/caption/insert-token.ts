export interface TextSelection {
  start: number;
  end: number;
}

export function insertToken(
  template: string,
  key: string,
  selection: TextSelection,
) {
  const start = Math.max(0, Math.min(template.length, selection.start));
  const end = Math.max(start, Math.min(template.length, selection.end));
  const token = `{${key}}`;
  return {
    template: template.slice(0, start) + token + template.slice(end),
    cursor: start + token.length,
  };
}

export function usedTokens(template: string): Set<string> {
  return new Set(
    Array.from(template.matchAll(/\{([^{}]+)\}/gu), (match) => match[1]!),
  );
}
