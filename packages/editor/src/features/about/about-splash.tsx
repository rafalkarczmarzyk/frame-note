// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import { Modal } from '@/components/ui/modal';
import { useEffect, useId, useRef, useState } from 'react';
import {
  ExternalLink,
  History,
  LockKeyhole,
  ScrollText,
  X,
} from 'lucide-react';
import { appVersion as version, appBuild } from '@/lib/build-info';
import { GitHubMark } from '@/components/brand/github-mark';
import { FrameNoteLogo } from '@/components/brand/frame-note-logo';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';

/** Shared web and desktop About dialog with local license notices. */
export function AboutSplash({ onClose }: { onClose: () => void }) {
  const title = useId();
  const description = useId();
  const [legal, setLegal] = useState(false);
  const [legalText, setLegalText] = useState('');
  const [legalError, setLegalError] = useState(false);
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const [nativeSelected, setNativeSelected] = useState(false);
  const legalHeading = useRef<HTMLHeadingElement>(null);
  const legalButton = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!legal) return;
    legalHeading.current?.focus();
    const controller = new AbortController();
    fetch('/legal/native.json', { signal: controller.signal })
      .then((r) => r.json())
      .then((files) =>
        setNativeAvailable(Array.isArray(files) && files.length > 0),
      )
      .catch(() => {
        /* Web previews and interrupted requests have no native runtime notices. */
      });
    Promise.all(
      (nativeSelected
        ? ['ELECTRON.txt', 'CHROMIUM.html']
        : [
            'LICENSE.txt',
            'LICENSING.txt',
            'PHOTOGRAPHS.txt',
            'THIRD_PARTY_NOTICES.txt',
          ]
      ).map(async (name) => {
        const response = await fetch(`/legal/${name}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw Error('License material unavailable');
        const text = await response.text();
        return name.endsWith('.html')
          ? (new DOMParser().parseFromString(text, 'text/html').body
              .textContent ?? '')
          : text;
      }),
    )
      .then((parts) =>
        setLegalText(parts.join('\n\n' + '='.repeat(72) + '\n\n')),
      )
      .catch(() => {
        if (!controller.signal.aborted) setLegalError(true);
      });
    return () => controller.abort();
  }, [legal, nativeSelected]);
  const sourceUrl = /^[a-f0-9]+(?:-dirty)?$/.test(appBuild)
    ? `https://github.com/rafalkarczmarzyk/frame-note/tree/${appBuild.replace(/-dirty$/, '')}`
    : 'https://github.com/rafalkarczmarzyk/frame-note';
  const linkClass =
    'inline-flex items-center gap-1 rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring';
  const projectLinks = (
    <nav
      aria-label="Project links"
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-content-muted"
    >
      {[
        {
          label: 'GitHub',
          href: 'https://github.com/rafalkarczmarzyk/frame-note',
          Icon: GitHubMark,
        },
        {
          label: 'Changelog',
          href: 'https://github.com/rafalkarczmarzyk/frame-note/blob/master/CHANGELOG.md',
          Icon: History,
        },
      ].map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <Icon
            className="size-3 shrink-0"
            aria-hidden="true"
            focusable="false"
          />
          {label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
      <a
        ref={legalButton}
        href={`#${title}-licenses`}
        aria-current={legal ? 'page' : undefined}
        className={linkClass}
        onClick={(event) => {
          event.preventDefault();
          if (!legal) {
            setLegalError(false);
            setLegalText('');
            setNativeSelected(false);
            setLegal(true);
          }
        }}
      >
        <ScrollText
          className="size-3 shrink-0"
          aria-hidden="true"
          focusable="false"
        />
        Licenses
      </a>
    </nav>
  );
  return (
    <Modal
      titleId={title}
      descriptionId={description}
      onClose={onClose}
      closeOnBackdrop
      className="w-[min(880px,94vw)]"
    >
      <div className="relative isolate overflow-hidden">
        <div className="absolute right-3 top-3 z-10">
          <IconButton
            tooltip="Close About FrameNote"
            label="Close about FrameNote"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </IconButton>
        </div>
        <img
          src="/images/start-screen-bird.jpg"
          alt="Blue tit perched on a garden fence"
          width={2560}
          height={1706}
          className="pointer-events-none absolute -right-[58%] -top-[32%] -z-20 h-[170%] w-[170%] max-w-none object-cover object-center"
        />
        <section
          aria-hidden={legal || undefined}
          inert={legal}
          className={`about-frosted relative isolate flex min-h-[min(560px,78svh)] flex-col gap-6 px-6 pb-6 pt-8 sm:w-1/2 sm:px-8 ${legal ? 'invisible' : ''}`}
        >
          <div className="pointer-events-none absolute inset-0 -z-10 bg-app-base opacity-60" />
          <header className="space-y-3">
            <FrameNoteLogo className="h-auto w-60 max-w-full" />
            <p data-build-info className="text-xs text-content-secondary">
              v{version} · build {appBuild}
            </p>
          </header>
          <div className="flex flex-1 flex-col justify-center gap-5">
            <h1
              id={!legal ? title : undefined}
              className="font-display text-[44px] font-semibold leading-tight"
            >
              Leave your
              <br />
              mark.
            </h1>
            <p
              id={!legal ? description : undefined}
              className="max-w-xs text-sm leading-6"
            >
              Add a watermark, logo, or photo details.
            </p>
            <p className="flex items-center gap-2 text-xs text-content-secondary">
              <LockKeyhole className="size-3.5 shrink-0" aria-hidden="true" />
              Photos stay on your device.
            </p>
          </div>
          <footer className="space-y-3">
            <p className="text-[11px] leading-5 text-content-secondary">
              © 2026 Rafał Karczmarzyk
              <br />
              GPL-3.0-or-later · No warranty
            </p>
            {projectLinks}
          </footer>
        </section>
        {legal && (
          <section
            id={`${title}-licenses`}
            className="about-frosted absolute inset-0 isolate flex min-h-0 flex-col gap-4 overflow-y-auto px-6 pb-6 pt-12 sm:px-8"
          >
            <div className="pointer-events-none absolute inset-0 -z-10 bg-app-base opacity-60" />
            <h1
              id={title}
              ref={legalHeading}
              tabIndex={-1}
              className="text-xl font-semibold"
            >
              Licenses and notices
            </h1>
            {nativeAvailable && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={!nativeSelected}
                  onClick={() => {
                    setLegalError(false);
                    setLegalText('');
                    setNativeSelected(false);
                  }}
                >
                  Application licenses
                </Button>
                <Button
                  variant="outline"
                  disabled={nativeSelected}
                  onClick={() => {
                    setLegalError(false);
                    setLegalText('');
                    setNativeSelected(true);
                  }}
                >
                  Electron and Chromium notices
                </Button>
              </div>
            )}
            <p id={description} className="text-sm text-content-secondary">
              FrameNote code: GPL-3.0-or-later. No warranty. Included
              photographs and artwork have separate terms.
            </p>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkClass} text-xs text-content-secondary`}
            >
              {appBuild.endsWith('-dirty')
                ? 'Base source (local changes)'
                : 'Source code for this build'}
              <ExternalLink className="size-3" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {legalError ? (
              <p role="alert">
                License files could not be loaded. Check the legal folder
                included with this build.
              </p>
            ) : (
              <pre
                aria-label="Full licenses and notices"
                tabIndex={0}
                className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-panel-border p-4 text-xs"
              >
                {legalText || 'Loading licenses…'}
              </pre>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setLegal(false);
                requestAnimationFrame(() => legalButton.current?.focus());
              }}
            >
              Back to About
            </Button>
          </section>
        )}
      </div>
    </Modal>
  );
}
