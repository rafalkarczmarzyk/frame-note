function parseVersion(value) {
  const match =
    /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?$/u.exec(
      value,
    );
  if (!match) return null;
  return {
    core: match.slice(1, 4).map(Number),
    pre: match[4]?.split('.') ?? null,
  };
}

function isNewerVersion(candidate, current) {
  const next = parseVersion(candidate);
  const installed = parseVersion(current);
  if (!next || !installed) return false;
  for (let i = 0; i < 3; i++)
    if (next.core[i] !== installed.core[i])
      return next.core[i] > installed.core[i];
  if (!next.pre) return !!installed.pre;
  if (!installed.pre) return false;
  for (let i = 0; i < Math.max(next.pre.length, installed.pre.length); i++) {
    if (next.pre[i] === undefined) return true;
    if (installed.pre[i] === undefined) return false;
    if (next.pre[i] === installed.pre[i]) continue;
    const a = /^\d+$/u.test(next.pre[i]);
    const b = /^\d+$/u.test(installed.pre[i]);
    if (a && b) return Number(next.pre[i]) > Number(installed.pre[i]);
    if (a !== b) return !a;
    return next.pre[i] > installed.pre[i];
  }
  return false;
}

function checkForUpdates(releases, currentVersion) {
  const parsed = releasesSchema.safeParse(releases);
  if (!parsed.success) return null;
  const release = parsed.data.find(
    (item) =>
      /^https:\/\/github\.com\/rafalkarczmarzyk\/frame-note\/releases\/tag\/[\w.-]+$/u.test(
        item.html_url,
      ) &&
      !item.draft &&
      isNewerVersion(item.tag_name, currentVersion),
  );
  return release
    ? { version: release.tag_name.replace(/^v/u, ''), url: release.html_url }
    : null;
}

module.exports = { checkForUpdates, isNewerVersion };
const { z } = require('zod');

const releaseSchema = z.object({
  tag_name: z.string(),
  prerelease: z.boolean(),
  draft: z.boolean(),
  html_url: z.string().url(),
});
const releasesSchema = z.array(releaseSchema);
