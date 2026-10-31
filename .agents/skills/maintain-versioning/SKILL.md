---
name: maintain-versioning
description: Maintain FrameNote beta versions, changelog and local version tags when committing completed application changes to master or merging an accepted task. Also use for explicit versioning or changelog requests. Development branch commits do not bump versions.
---

# Maintain versioning — FrameNote

Apply these project conventions when preparing an authorized commit or merge.
This skill does not authorize commits, merges, product-stage acceptance, remote
pushes, publication, signing or distribution. An explicit user override wins;
report any intentionally skipped versioning or changelog action.

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
- Development branch commits and intermediate checkpoints do not bump versions
  or create version tags. Update a task's entries under Unreleased when useful,
  refining them across iterations instead of duplicating them.

## Version boundary

An authorized commit of a completed application change directly to `master`, or
an authorized merge of an accepted task into `master`, includes the version
update, dated changelog section and local version tag without another question.
Do not infer merge permission or task acceptance from a request to commit work
on a task branch. One completed task entering `master` gets one increment, even
if it contains multiple commits, features or fixes.

Qualifying changes affect application behavior, appearance, compatibility,
runtime dependencies, delivery or packaging. Documentation-only, test-only,
tooling-only, internal refactoring without observable effects, and skill-only
changes do not require a bump or a release entry. Judge configuration changes
by their actual effect on the application. Never add filler entries.

## Numbering and compatibility

- Start the beta series at `0.1.0-beta`. Initial transition from alpha must
  be explicitly requested; installing this skill alone does not start a beta.
- Before stable 1.0, use `0.x.y-beta` without a trailing prerelease counter.
  Compatible fixes increment PATCH (`0.1.0-beta` → `0.1.1-beta`); features and
  incompatible changes increment MINOR and reset PATCH (`0.1.1-beta` →
  `0.2.0-beta`). Mixed tasks use the highest required increment. Every completed
  application task entering master gets a new base version, not a beta counter.
  Incompatible changes still require migration and explicit changelog coverage.
  Alpha versions follow the same format, `0.x.y-alpha`. This is the project's
  prerelease convention using SemVer; reserve `1.0.0` for the first finished
  stable product. Never reset a larger base version to 1.0.
- Moving to `rc` or stable `1.0.0` requires an explicit user decision.
- After stable 1.0, use PATCH for compatible fixes, MINOR for compatible new
  functionality, and MAJOR for incompatible changes to the documented contract.
  Reset lower components appropriately. Choose the highest required increment
  when several changes are combined. Use channel labels without numerical
  counters for later prereleases too, e.g. `1.1.0-beta` or `1.1.0-rc`.
- FrameNote's compatibility contract concerns documented supported preset/data
  formats and application capabilities. An internal API or visual redesign alone
  is not automatically a MAJOR change. Define the stable compatibility contract
  before promoting to 1.0; do not invent data migration guarantees.
- Before the first beta, implement the versioned Zod preset schemas and migration
  pipeline required by NTH-002 and `docs/PRESET_VERSIONING_PLAN.md`. This replaces
  the earlier decision to defer compatibility. Do not declare this prerequisite
  complete until implemented and verified. Schema versions are independent of
  application SemVer: every new persisted format version requires its own Zod
  parser, an explicit migration from the previous supported format, and tests.
  Preserve source data when conversion is unsupported or lossy; describe
  compatibility implications in the changelog. Forward conversion is the default;
  reverse conversion is not automatically guaranteed.
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
- At the version boundary, move only the completed task's Unreleased entries to
  its dated section; preserve unrelated pending work. Consolidate entries for
  the same result. Keep an empty Unreleased heading ready for later work.
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
3. Verify matching valid SemVer across manifests, the expected increment and
   changelog coverage. Use a repository checker if one exists; otherwise inspect
   them directly and report that verification is manual. A skill is agent
   guidance, not a Git hook or CI enforcement mechanism.
4. Only after the authorized commit on `master` succeeds, create an annotated
   local tag `v<version>` on that commit. Check its target and version contents.
   Never tag a task branch commit as a completed version. If tagging fails,
   report the committed state and missing tag; do not create another bump.
5. Report version, changelog, commit and local tag, or explain why no bump was
   required. Do not push, publish, package, sign or advance product stages merely
   because the local version was recorded.

## Build identity

The intended shared web/desktop display is the product version plus a build
identifier captured at build time, e.g. `0.2.0-beta · build 5b0acad`, with
`dirty` for uncommitted source changes. Generated build output must not by itself
make a build dirty. If commit identity is unavailable, label it unknown rather
than inventing a hash. Keep package SemVer separate from display metadata and
native platform build-number constraints.

Do not implement build identity or build counters merely by invoking this skill;
that application change needs its own authorized scope. Until implemented, do
not claim that About distinguishes builds of the same version.
