---
name: change-workflow
description: Plan and implement FrameNote desktop, web and shared-model changes with acceptance criteria, a version forecast, staged implementation, automated verification, user acceptance and release handoff. Use also when continuing an existing stage, addressing review feedback or preparing an accepted application change for release. Ordinary code questions and documentation-only or skill-only work do not require the full application workflow.
---

# Change workflow — FrameNote

Guide application changes through planning, implementation, verification, user
acceptance and an authorized release. Explicit invocation: `$change-workflow`.
Continue the current task and its recorded decisions rather than restarting the
process on every message. This skill grants no implementation, commit, merge,
push, packaging or deployment authorization by itself.

## Sources and task record

Follow root `AGENTS.md` and its required product/UI documents. Use
[maintain-versioning](../maintain-versioning/SKILL.md) for version forecasts,
compatibility decisions, changelog and release operations; keep versioning rules
there rather than maintaining a second copy here.

For a substantive task, maintain one plan in `docs/plans/<task-slug>.md`, in
Polish unless requested otherwise. Find an existing plan before creating one.
Use [the plan template](references/plan-template.md) when creating a plan; adapt
it to the task rather than filling irrelevant sections. Capture prior explicit
decisions from the conversation, including exceptions and authorizations.
Do not treat assistant proposals as accepted user decisions.

For a small isolated fix, a short plan and AC in the conversation are sufficient;
persist them if work spans stages or needs a later handoff. Ordinary questions
and documentation/test/tool/skill-only edits use proportionate verification and
do not require application AC, manual acceptance cycles or a product release.

## Planning

Before implementing a new task, establish:

- The problem, intended behavior, scope and explicit exclusions.
- Impact on desktop, web, shared models and existing saved data. Mark unaffected
  platforms explicitly; a desktop-only UI can still affect shared preset readers.
- Numbered, observable acceptance criteria (`AC-01`, etc.), including relevant
  errors and compatibility cases. Attach automated/manual verification methods.
- Stages, dependencies and which stage the user has authorized. Each completed
  stage goes through user review before the next stage starts.
- Current product version from the manifests and a forecast version with its
  reason under `maintain-versioning`, or why no product bump is needed.
- Preset/data format impact separately from product SemVer, including migrations
  and any explicit user exceptions. Explain limitations of older readers.

Present the plan and version forecast. Planning alone does not authorize coding.
Honor approval already present in the conversation without asking for it again.
Record material scope changes and their effect on AC/version; get agreement
before implementing added scope. Routine implementation choices within accepted
AC do not need another approval. Record explicitly deferred ideas using
`deferred-ideas`; never silently add them to the current task.

## Implementation and changelog

Use the branch policy from `AGENTS.md` and `maintain-versioning`. Work only on
the authorized stage, preserving unrelated local work. Update the plan with
decisions and progress. Working commits require a user instruction and do not
imply acceptance, merge permission or a release version bump.

Keep task-specific English entries in root `CHANGELOG.md` under Unreleased as
user-visible behavior is implemented. Refine entries as scope changes; describe
the actual result and compatibility implications rather than attempts. Preserve
unrelated entries. Do not edit published release sections to add new behavior,
invent a release entry for exempt work, or claim unfinished behavior is shipped.

## Verification and user review

Track implemented, automatically verified and user-accepted as distinct states.
For each AC record pass/fail/not-run, evidence and outstanding manual review.
Never infer user acceptance from passing tests, silence or a working commit.

Run relevant project checks from `AGENTS.md` and package scripts. Choose tests
according to behavior: unit tests for domain logic, targeted flows for persistence
and export, desktop checks for native behavior, and web checks for shared changes.
UI changes require the prescribed visual checks, reviewed expected/actual/diff
images and appropriate Storybook coverage. Do not regenerate baselines merely
to hide failures. Report unavailable environments and known pre-existing failures
with evidence; do not mark unexecuted checks passed.

At stage handoff provide:

- Implemented behavior and AC status, automated results and remaining limitations.
- A short manual checklist tied to AC, identifying desktop/web as appropriate.
- The build/version being reviewed and commit identity or dirty state when
  available. Do not claim tests of an installed build verify different source.
- The decision needed from the user: corrections or stage acceptance.

Apply feedback within the stage, rerun affected checks, and obtain renewed
acceptance for materially changed behavior. Do not repeat unaffected expensive
checks without a reason. Keep the record current so another chat can resume it.

## Accepted change and release

Acceptance of behavior and authorization to commit/merge/push are separate.
“Works” accepts behavior; “accept, commit and push with a tag” can authorize the
whole sequence. Respect existing explicit permission without asking again.
Do not ask for final release approval until the concrete diff, checks and release
contents are ready for review. Never proceed to the next unapproved stage.

After final acceptance, keep changes in `Unreleased` unless the user has
explicitly requested a release. For an explicitly requested release, use
[`prepare-release`](../prepare-release/SKILL.md), then apply
`maintain-versioning` for manifest and tag conventions:

1. Compare the final diff to AC and accepted scope. Inspect current master,
   manifests and tags; recompute the proposed version if the base or selected
   release scope has changed. Explain any revision. A release may include many
   accepted tasks and commits; it receives one product increment.
2. Synchronize product manifests/lockfile metadata and move only the accumulated
   entries selected for this release to the dated English section. Retain an
   Unreleased heading and later/unselected entries. Cover compatibility,
   migrations and required user actions where applicable. Run required checks.
3. With commit/merge authorization, create the final master commit containing
   implementation, version and changelog, preferably via squash for task branches.
   Only after success create and verify its annotated local version tag.
4. With explicit push authorization, verify the intended remote and branch and
   push that branch and the specific release tag. Avoid pushing unrelated tags.
   Verify remote results. Do not force, move existing tags or rewrite history
   to overcome a rejection without explicit authorization.
5. Report the version, AC/checks, commit, tag and local/remote completion state.
   If an operation fails, preserve the successful work and finish or report the
   missing operation; never create an extra version bump just to retry a push
   or tag. A Git push does not itself authorize packaging, signing, application
   publication or web deployment. Report any known deployment triggered by the
   authorized remote operation rather than claiming deployment was verified.

This is agent guidance, not an enforced CI/Git gate. Do not claim automatic
enforcement or a successful release without the corresponding evidence.
