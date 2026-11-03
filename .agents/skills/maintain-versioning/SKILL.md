---
name: maintain-versioning
description: Maintain FrameNote's synchronized product version and changelog conventions. Use for development changelog updates and explicitly requested release preparation; ordinary commits and merges do not create a release version or tag.
---

# Maintain versioning — FrameNote

Apply these conventions to product versions and changelog entries. A normal
commit or merge is a development checkpoint, not a release boundary. Use
[prepare-release](../prepare-release/SKILL.md) only when the user explicitly
chooses to prepare a release. This skill does not authorize commits, merges,
product-stage acceptance, remote pushes, publication, signing or distribution.
An explicit user override wins.

## Branches and review

- Small, self-contained fixes may go directly to `master` after verification.
- Use a `codex/` task branch for new features, substantial UI changes, refactors,
  and work requiring several user-review iterations. Keep it until acceptance.
  Do not introduce a permanent `develop` branch.
- PRs are optional. Prefer one for large or risky changes when a reviewable diff,
  validation summary and persistent discussion help. Do not create or publish a
  PR solely because a branch exists; remote actions need user authorization.
- Prefer squash merge for a completed task: one logical result on `master`.
  Preserve other contributors' or parallel tasks' changes; do not rewrite shared
  history. Inspect the actual branch and diff before deciding the workflow.
- Commits and merges to `master` accumulate under Unreleased. Refine and
  consolidate entries as work progresses; do not bump versions or create tags
  for each completed task.

## Version boundary

Only an explicitly requested release preparation creates a version boundary,
dated changelog section, or release tag. Accumulated work may span many commits
and merges. A request to commit or merge alone is not a request to release.

Qualifying changes affect application behavior, appearance, compatibility,
runtime dependencies, delivery or packaging. Documentation-only, test-only,
tooling-only, internal refactoring without observable effects, and skill-only
changes do not require a bump or a release entry. Judge configuration changes
by their actual effect on the application. Never add filler entries.

## Numbering and compatibility

- Start the beta series at `0.1.0-beta`. Initial transition from alpha must
  be explicitly requested; installing this skill alone does not start a beta.
- Before stable 1.0, use `0.x.y-beta` without a trailing prerelease counter.
  Prefer PATCH for fixes and compatible refinements within existing documented
  capabilities (`0.1.0-beta` → `0.1.1-beta`). Use MINOR and reset PATCH when a
  release adds a distinct supported capability or changes the compatibility
  contract (`0.1.1-beta` → `0.2.0-beta`). Do not misclassify a genuinely new
  capability as PATCH solely to avoid a MINOR increment. Assess combined
  Unreleased changes once at the release boundary; do not bump once per task.
  Incompatible changes still require migration and explicit changelog coverage.
  Alpha versions follow the same format, `0.x.y-alpha`. This is the project's
  prerelease convention using SemVer; reserve `1.0.0` for the first finished
  stable product. Never reset a larger base version to 1.0.
- Moving to `rc` or stable `1.0.0` requires an explicit user decision.
- After stable 1.0, use PATCH for compatible fixes and refinements, MINOR for
  compatible new functionality, and MAJOR for incompatible changes to the
  documented contract.
  Reset lower components appropriately. Choose the highest required increment
  when several changes are combined. Use channel labels without numerical
  counters for later prereleases too, e.g. `1.1.0-beta` or `1.1.0-rc`.
- FrameNote's compatibility contract concerns documented supported preset/data
  formats and application capabilities. An internal API or visual redesign alone
  is not automatically a MAJOR change. Define the stable compatibility contract
  before promoting to 1.0; do not invent data migration guarantees.
- The first official preset format is v1, shared by web and desktop. Earlier
  development JSON and storage are unsupported: do not add legacy parsers,
  cleanup or migration of pre-v1 data. Do not change the web storage key for
  this purpose. Preset schema versions are independent of application SemVer.
  Every future format requires a separate frozen Zod schema, migration from the
  previous supported version, a file-conversion script sharing that code, and
  fixture tests. There is no migration or conversion script for initial v1.
  Preserve originals during future conversions; report unsupported/lossy changes.
  Forward conversion is the default; reverse conversion is not guaranteed.
- Use one product version for root, web, desktop, editor and core manifests.
  Root `package.json` is authoritative. Synchronize the other workspace manifests
  and affected lockfile metadata; inspect actual files rather than assuming a
  package-manager command updates everything.
- Never reuse or move a published version/tag, or rewrite old commits to assign
  versions retrospectively without explicit instruction. The user authorized
  one-time normalization: pre-MVP → `v0.0.1-alpha`, MVP → `v0.0.2-alpha`,
  current alpha → `0.0.3-alpha`. Preserve historical tag target commits;
  historical manifests are not rewritten. Do not repeat this operation later.

SemVer reference: https://semver.org/ . Build metadata does not affect version
precedence; a commit hash identifies code, not release ordering.

## Changelog

- Maintain root `CHANGELOG.md` in concise English. Keep Unreleased at the top,
  followed by numbered sections such as `## [0.1.0-beta] - YYYY-MM-DD`, newest first.
  Use the user's local date and Added, Changed, Fixed or Removed as appropriate.
- Describe resulting user behavior and compatibility implications, not attempts,
  implementation chronology or a transcript of commits.
- At the version boundary, move only the accumulated entries selected for this
  release to its dated section; preserve later or unrelated pending work.
  Consolidate entries for the same result. Keep an empty Unreleased heading
  ready for later work.
- For the first beta, summarize the current delivered baseline from Unreleased
  and the actual diff/history. Retain historical milestone sections as history;
  do not invent past SemVer releases or claim new work for old milestones.
- Do not append later behavior changes to an already versioned section. Record
  them in a new version. Explicit changelog requests may be handled separately
  without implicitly bumping versions or committing.

## Commit and checks

1. Finish authorized work and relevant project checks; inspect the intended
   diff, branch, manifests, changelog and existing local tags.
2. Determine whether this is a version boundary or a development checkpoint.
   At a boundary, calculate an unused increasing version, synchronize manifests
   and prepare its changelog section in the same logical commit as the task.
   For squash merges, include these changes before finalizing the squash commit.
3. For an explicitly authorized release, verify matching valid SemVer across
   manifests, the selected increment and changelog coverage with
   `pnpm check:version`. Use `pnpm version:set <version>` to synchronize
   manifests. Run `pnpm check:version --base=<ref>` for a new version when no
   existing tag is being recovered.
4. Create a local version tag only as part of an explicitly authorized release
   workflow. Confirm whether pushing it triggers a build or publication first.
   A commit or merge by itself never creates a tag. Recovery of a failed,
   unpublished version follows `prepare-release`; never reuse a published tag.
5. Report the version/changelog state. Do not push, publish, package, sign or
   advance product stages without the corresponding explicit authorization.

## Build identity

The intended shared web/desktop display is the product version plus a build
identifier captured at build time, e.g. `0.2.0-beta · build 5b0acad`, with
`dirty` for uncommitted source changes. Generated build output must not by itself
make a build dirty. If commit identity is unavailable, label it unknown rather
than inventing a hash. Keep package SemVer separate from display metadata and
native platform build-number constraints.

Build identity is injected by Vite at build time and displayed in About.
Without Git, prepared source archives use `.framenote-source.json`; without either
source it reads unknown. No separate build counter is maintained. Desktop beta
packages are built by the tagged release workflow. A local commit/tag does not
publish; pushing the release tag triggers automatic publication after its checks.
Inspect the workflow and obtain the corresponding remote-action authorization.
