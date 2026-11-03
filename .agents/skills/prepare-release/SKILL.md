---
name: prepare-release
description: Prepare an explicitly requested FrameNote release from accumulated Unreleased changes, select the smallest SemVer increment justified by the combined changes, and recover an unpublished release build at the same version after CI failure.
---

# Prepare Release — FrameNote

Use only when the user asks to prepare or make a release, or to recover a failed
release build. Ordinary commits, merges, and completed tasks accumulate in
`CHANGELOG.md` under `Unreleased`; they do not create a version, dated release
section, or tag. This skill prepares release content but does not itself
authorize committing, pushing, tagging, publishing, signing, or distributing.

Read [maintain-versioning](../maintain-versioning/SKILL.md) for the shared
manifest, changelog, compatibility, and tag rules. Check the workflow files and
scripts for the actual current release path before acting; they can change.

## Prepare a release

1. Inspect the current branch and working tree, all workspace manifests,
   `CHANGELOG.md`, `Unreleased`, existing tags, and the complete set of pending
   changes since the last release. Preserve unrelated work and changelog entries.
2. Summarize the accumulated user-visible changes and identify any migration,
   compatibility, packaging, or documentation consequences. Refine and
   consolidate `Unreleased`; do not turn each commit or task into its own
   release entry.
3. Select the smallest SemVer increment justified by the combined release:
   - Prefer PATCH for fixes and compatible refinements within the existing
     documented capabilities.
   - Use MINOR when the release adds a distinct supported capability or changes
     the documented compatibility contract. In 0.x, follow the project's
     convention that a MINOR increment resets PATCH.
   - Never label a genuinely new capability PATCH solely to avoid a MINOR bump.
   - MAJOR applies only after the stable compatibility contract and 1.0 rules
     require it. An alpha/beta/RC/stable transition always requires explicit
     direction.
4. Present the proposed version and concise release notes. If the user already
   explicitly authorized the version and release preparation in this request,
   prepare the concrete result without asking again. Otherwise ask only for a
   decision that is necessary to choose between materially different versions
   or release contents.
5. At the release boundary, move the accumulated, completed `Unreleased`
   entries into one dated English section, retain an empty `Unreleased` heading,
   synchronize all product manifests and required lockfile metadata, and run
   version, changelog, build, and release checks. Inspect the final diff and
   report the exact version and files. Do not create a task-level version bump
   on every merge.

## Recover a failed release build without wasting the version

Distinguish a rerun from a source correction:

- For a transient runner or infrastructure failure, rerun only the failed jobs
  in the existing GitHub Actions run. Keep its commit and tag unchanged. Respect
  the workflow's retry cap and automatic capacity-retry rules.
- For a source or packaging defect, fix it on `master` through the normal review
  path while retaining the same unreleased product version and its release
  changelog section. Do not bump the version just to rerun CI.
- If the failed run used a version tag that has never been published, the
  corrected release commit may need that same tag to point at the corrected
  commit to trigger the tag workflow. First verify the old workflow and all
  related runs, remote tag target, draft/published release state, asset state,
  `master` ancestry, and that no release for the version has been published.
  Keep the version and release notes unchanged. Repointing a remote tag rewrites
  a shared reference: do it only after the user explicitly authorizes that
  exact retry and the intended tag/commit are shown for review. Never use this
  path for a published version or to overwrite a successful release.
- If GitHub supports a rerun or workflow dispatch path for the existing failed
  version, prefer it over moving a tag. Confirm its ref and commit match the
  intended release before dispatching.

Do not delete a draft or its assets, force-push a tag, publish a draft, or create
a replacement release as an automatic recovery step. Do not loop retries: after
one infrastructure rerun or one reviewed source correction still fails, report
the failing job, evidence, current tag/release state, and the next concrete
choice. Never advance the version merely to make CI green.

## Finish and hand off

Preparing a release is distinct from publishing it. Before any externally
visible action, present the exact version, changelog section, commit, tag and
release state. Require the user's explicit authorization for commit, tag/push,
draft creation or completion, publication, signing and distribution as required
by the project's other instructions. Report a failed pipeline against its
original version and preserve the evidence needed to retry it.
