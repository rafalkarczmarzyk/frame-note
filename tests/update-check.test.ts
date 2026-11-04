import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const {
  checkForUpdates,
  isNewerVersion,
  requestUpdate,
} = require('../apps/desktop/update-check.cjs');
const base = 'https://github.com/rafalkarczmarzyk/frame-note/releases/tag/';
const entry = (tag: string, url = base + tag) =>
  `<entry><title>Release ${tag}</title><link rel="alternate" href="${url}"/></entry>`;
const feed = (...entries: string[]) =>
  `<feed xmlns="http://www.w3.org/2005/Atom">${entries.join('')}</feed>`;

describe('desktop Atom release detection', () => {
  it('selects the highest newer version independently of feed order and title', () => {
    expect(
      checkForUpdates(
        feed(entry('v0.6.1-beta'), entry('v0.7.0-beta'), entry('v0.6.0')),
        '0.6.0-beta',
      ),
    ).toEqual({ version: '0.7.0-beta', url: base + 'v0.7.0-beta' });
  });
  it('handles stable, equal, older and empty feeds', () => {
    expect(checkForUpdates(feed(entry('v0.6.0')), '0.6.0-beta')?.version).toBe(
      '0.6.0',
    );
    expect(
      checkForUpdates(
        feed(entry('v0.6.0-beta'), entry('v0.5.0')),
        '0.6.0-beta',
      ),
    ).toBeNull();
    expect(checkForUpdates(feed(), '0.6.0-beta')).toBeNull();
  });
  it.each([
    'https://example.com/v9.0.0',
    base + 'v9.0.0?x=1',
    base + 'v9.0.0#x',
    base.replace('github.com', 'github.com.evil.test') + 'v9.0.0',
  ])('ignores an untrusted release link: %s', (url) => {
    expect(
      checkForUpdates(
        feed(entry('v9.0.0', url), entry('v0.6.1-beta')),
        '0.6.0-beta',
      )?.version,
    ).toBe('0.6.1-beta');
  });
  it('ignores foreign namespace entries and non-release links', () => {
    expect(
      checkForUpdates(
        feed(
          '<entry xmlns="urn:other"><link href="' + base + 'v9.0.0"/></entry>',
          '<entry><link rel="self" href="' + base + 'v9.0.0"/></entry>',
          entry('invalid'),
        ),
        '0.6.0-beta',
      ),
    ).toBeNull();
  });
  it.each([
    '<html/>',
    '<feed xmlns="wrong"/>',
    '<feed xmlns="http://www.w3.org/2005/Atom"><entry></feed>',
    '<!DOCTYPE feed><feed/>',
    'x'.repeat(2_000_001),
  ])('rejects invalid feed %#', (xml) => {
    expect(() => checkForUpdates(xml, '0.6.0-beta')).toThrow();
  });
  it.each([
    ['1.0.0-beta.2', '1.0.0-beta', true],
    ['1.0.0-beta', '1.0.0-beta.2', false],
    ['1.0.0-beta.10', '1.0.0-beta.2', true],
    ['1.0.0', '1.0.0-beta', true],
    ['1.0.0-beta', '1.0.0', false],
    ['01.0.0', '0.6.0-beta', false],
    ['1.0.0-beta..2', '0.6.0-beta', false],
    ['1.0.0-beta.02', '0.6.0-beta', false],
  ])('compares %s against %s', (candidate, current, expected) => {
    expect(isNewerVersion(candidate, current)).toBe(expected);
  });
});

describe('update transport', () => {
  it('requests Atom on every call, without a daily cache', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => feed(entry('v0.6.1-beta')),
    });
    for (let i = 0; i < 2; i++)
      expect(
        await requestUpdate('0.6.0-beta', { fetchImpl, env: {} }),
      ).toMatchObject({ status: 'available' });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://github.com/rafalkarczmarzyk/frame-note/releases.atom',
      expect.objectContaining({
        redirect: 'error',
        headers: { Accept: 'application/atom+xml' },
      }),
    );
  });
  it('never calls the network in native test mode, including repeated startup checks', async () => {
    const fetchImpl = vi.fn(() => {
      throw Error('Network forbidden');
    });
    for (let i = 0; i < 3; i++)
      expect(
        await requestUpdate('0.6.0-beta', {
          fetchImpl,
          env: { FRAMENOTE_TEST_UPDATE_FEED: '1' },
        }),
      ).toEqual({ status: 'current' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it('distinguishes network and invalid-feed errors from no update', async () => {
    for (const fetchImpl of [
      vi.fn().mockRejectedValue(Error('timeout')),
      vi.fn().mockResolvedValue({ ok: false }),
      vi.fn().mockResolvedValue({ ok: true, text: async () => '<html/>' }),
    ]) {
      expect(await requestUpdate('0.6.0-beta', { fetchImpl, env: {} })).toEqual(
        { status: 'error' },
      );
    }
    expect(
      await requestUpdate('0.6.0-beta', {
        fetchImpl: vi
          .fn()
          .mockResolvedValue({ ok: true, text: async () => feed() }),
        env: {},
      }),
    ).toEqual({ status: 'current' });
  });
});
