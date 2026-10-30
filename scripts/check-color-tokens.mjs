import process from 'node:process';
import console from 'node:console';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const css = await readFile(
  path.join(root, 'packages/editor/src/index.css'),
  'utf8',
);
function block(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Missing ${marker}`);
  const brace = source.indexOf('{', start);
  let depth = 1,
    end = brace + 1;
  while (depth && end < source.length) {
    depth += Number(source[end] === '{') - Number(source[end] === '}');
    end++;
  }
  if (depth) throw new Error(`Unclosed ${marker}`);
  return { start, end, text: source.slice(start, end) };
}
const palette = block(css, '@theme');
const tokens = block(css, ':root {');
const issues = [];
const withoutPalette = css.slice(0, palette.start) + css.slice(palette.end);
if (/#(?:[\da-f]{3,8})\b|\b(?:rgb|rgba|hsl|hsla|oklch)\(/i.test(withoutPalette))
  issues.push('Literal colors must live in the @theme palette.');
const withoutTokens = css.slice(0, tokens.start) + css.slice(tokens.end);
if (withoutTokens.includes('color-mix('))
  issues.push('Color recipes must live in :root tokens.');
const declarations = new Set(
  [...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]),
);
for (const [, name] of css.matchAll(/var\((--[\w-]+)/g))
  if (!declarations.has(name)) issues.push(`Undefined CSS token: ${name}`);
async function scan(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) {
      await scan(file);
      continue;
    }
    if (
      !/\.(tsx?|css)$/.test(file) ||
      /\.(test|spec)\./.test(file) ||
      file.endsWith('index.css')
    )
      continue;
    const source = await readFile(file, 'utf8');
    const relative = path.relative(root, file);
    if (
      /#(?:[\da-f]{3,8})\b|\b(?:rgb|rgba|hsl|hsla|oklch|color-mix)\(/i.test(
        source,
      )
    )
      issues.push(
        `${relative}: use a named color token instead of a local recipe/literal.`,
      );
    if (
      /(?:bg|text|border|shadow|ring|outline|fill|stroke)-[\w-]+\/(?:\d+|\[[^\]]+\])/.test(
        source,
      )
    )
      issues.push(
        `${relative}: use a role token instead of a local color opacity.`,
      );
    if (
      /(?:bg|text|border|shadow|ring|outline|fill|stroke)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d+/.test(
        source,
      )
    )
      issues.push(
        `${relative}: use an application role instead of a Tailwind palette shade.`,
      );
  }
}
await scan(path.join(root, 'packages/editor/src'));
if (issues.length) {
  console.error([...new Set(issues)].join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Color tokens OK: ${(palette.text.match(/#[\da-f]+/gi) ?? []).length} base colors; ${(tokens.text.match(/color-mix\(/g) ?? []).length} shared recipes; no local recipes or opacity colors.`,
  );
