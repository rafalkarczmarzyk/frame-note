import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { checkForUpdates } = require('../apps/desktop/update-check.cjs') as {
  checkForUpdates: (
    releases: unknown,
    currentVersion: string,
  ) => { version: string; url: string } | null;
};

const release = (tag_name: string, options: Record<string, unknown> = {}) => ({
  tag_name,
  name: tag_name,
  prerelease: tag_name.includes('-'),
  draft: false,
  html_url: `https://github.com/rafalkarczmarzyk/frame-note/releases/tag/${tag_name}`,
  ...options,
});

describe('desktop update detection from mocked GitHub release responses', () => {
  it('returns a newer beta release and its release page URL', () => {
    const mockedResponse = [release('v0.4.1-beta'), release('v0.4.0-beta')];
    expect(checkForUpdates(mockedResponse, '0.4.0-beta')).toEqual({
      version: '0.4.1-beta',
      url: 'https://github.com/rafalkarczmarzyk/frame-note/releases/tag/v0.4.1-beta',
    });
  });

  it('detects a stable release newer than the installed beta', () => {
    expect(checkForUpdates([release('v0.4.0')], '0.4.0-beta')).toMatchObject({
      version: '0.4.0',
    });
  });

  it('does not offer an older or equal release', () => {
    expect(checkForUpdates([release('v0.4.0-beta')], '0.4.0-beta')).toBeNull();
    expect(checkForUpdates([release('v0.3.9')], '0.4.0-beta')).toBeNull();
  });

  it('skips drafts and malformed or untrusted release entries', () => {
    expect(
      checkForUpdates(
        [
          release('v0.5.0-beta', { draft: true }),
          release('v0.6.0-beta', {
            html_url: 'https://example.com/fake-release',
          }),
          { tag_name: 'v0.7.0-beta', prerelease: true },
        ],
        '0.4.0-beta',
      ),
    ).toBeNull();
  });

  it('returns no update for a non-array API response', () => {
    expect(
      checkForUpdates({ message: 'rate limit exceeded' }, '0.4.0-beta'),
    ).toBeNull();
  });
});
