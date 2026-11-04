function parseVersion(value) {
  const match =
    /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?$/u.exec(
      value,
    );
  if (
    !match ||
    match.slice(1, 4).some((part) => !Number.isSafeInteger(Number(part)))
  )
    return null;
  if (
    match[4]
      ?.split('.')
      .some(
        (part) =>
          !part ||
          (/^\d+$/u.test(part) && part.length > 1 && part.startsWith('0')),
      )
  )
    return null;
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
    if (next.pre[i] === undefined) return false;
    if (installed.pre[i] === undefined) return true;
    if (next.pre[i] === installed.pre[i]) continue;
    const a = /^\d+$/u.test(next.pre[i]);
    const b = /^\d+$/u.test(installed.pre[i]);
    if (a && b) return Number(next.pre[i]) > Number(installed.pre[i]);
    if (a !== b) return !a;
    return next.pre[i] > installed.pre[i];
  }
  return false;
}

const { DOMParser } = require('@xmldom/xmldom');
const ATOM = 'http://www.w3.org/2005/Atom';
const FEED_URL = 'https://github.com/rafalkarczmarzyk/frame-note/releases.atom';
const EMPTY_FEED = `<feed xmlns="${ATOM}"/>`;

function checkForUpdates(xml, currentVersion) {
  if (
    typeof xml !== 'string' ||
    xml.length > 2_000_000 ||
    /<!DOCTYPE|<!ENTITY/iu.test(xml)
  )
    throw Error('Invalid release feed.');
  const document = new DOMParser({
    onError() {
      throw Error('Invalid XML.');
    },
  }).parseFromString(xml, 'application/xml');
  const root = document.documentElement;
  if (root?.localName !== 'feed' || root.namespaceURI !== ATOM)
    throw Error('Invalid Atom feed.');
  let newest = null;
  for (const entry of Array.from(root.childNodes)) {
    if (entry.localName !== 'entry' || entry.namespaceURI !== ATOM) continue;
    for (const link of Array.from(entry.childNodes)) {
      if (
        link.localName !== 'link' ||
        link.namespaceURI !== ATOM ||
        (link.getAttribute('rel') && link.getAttribute('rel') !== 'alternate')
      )
        continue;
      const url = link.getAttribute('href');
      const tag =
        /^https:\/\/github\.com\/rafalkarczmarzyk\/frame-note\/releases\/tag\/(v?[0-9A-Za-z.-]+)$/u.exec(
          url ?? '',
        )?.[1];
      if (
        !tag ||
        !isNewerVersion(tag, currentVersion) ||
        (newest && !isNewerVersion(tag, newest.version))
      )
        continue;
      newest = { version: tag.replace(/^v/u, ''), url };
    }
  }
  return newest;
}

async function requestUpdate(
  currentVersion,
  { fetchImpl = fetch, env = process.env } = {},
) {
  try {
    // Native test launchers set this before any startup or restart can request updates.
    const xml =
      env.FRAMENOTE_TEST_UPDATE_FEED === '1'
        ? EMPTY_FEED
        : await (async () => {
            const response = await fetchImpl(FEED_URL, {
              headers: { Accept: 'application/atom+xml' },
              redirect: 'error',
              signal: AbortSignal.timeout(8000),
            });
            if (!response.ok) throw Error('Release feed unavailable.');
            return response.text();
          })();
    const release = checkForUpdates(xml, currentVersion);
    return release ? { status: 'available', release } : { status: 'current' };
  } catch {
    return { status: 'error' };
  }
}

module.exports = { checkForUpdates, isNewerVersion, requestUpdate };
