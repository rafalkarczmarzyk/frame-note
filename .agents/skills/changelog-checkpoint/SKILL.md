---
name: changelog-checkpoint
description: Ask about the FrameNote changelog when the user requests a commit after completing a planned task or iterating on a solution. Exclude routine documentation commits and intermediate work checkpoints.
---

# Changelog checkpoint — FrameNote

Apply this skill when a planned task has been implemented or a solution has been
refined through iterations, and the user then requests a commit of that result.
A formal plan file is not required; use the agreed task and conversation context.
It does not authorize commits or releases.

Do not ask for every commit. Intermediate work checkpoints, routine standalone
documentation or configuration edits, and edits to this skill do not trigger the
question by themselves. Do not invent a completed task to activate this skill.

## Before committing

- Inspect the intended commit changes and read the root `CHANGELOG.md`. Finish
  authorized implementation and relevant verification first.
- At this task checkpoint, ask whether to update the changelog for the result.
  Offer updating now or committing without an update. Briefly propose concrete
  English wording when applicable; explain if the changes are internal or already
  covered rather than silently skipping the question.
- Explain why the question is required: link this `SKILL.md` and quote
  “At this task checkpoint, ask whether to update the changelog for the result.”
- Wait for the answer before committing. Silence is not a decision. Continue
  independent authorized work while waiting when useful.
- An explicit instruction to update or skip the changelog for this result already
  answers the question. Do not ask again for the same result, including follow-up
  commits within that agreed scope. A new completed task or materially expanded
  result can establish a new checkpoint.

## Apply the decision

- If approved, update concise English entries under `Unreleased — toward 1.0`,
  using Added, Changed, Fixed, or Removed as needed. Describe actual behavior and
  relevant compatibility changes. Refine existing entries instead of duplicating
  them; do not add filler if they already cover the work.
- If declined, leave the changelog unchanged and proceed with the authorized
  commit. Skipping the update does not cancel the commit request.
- Verify formatting and the final diff. Include only agreed changes and preserve
  unrelated work and existing changelog entries.
- A commit is a checkpoint, not task completion, user acceptance, or a release.
  Do not bump versions, create release sections or tags, publish, or advance
  product stages without a separate instruction.

Ordinary implementation without a commit request does not require a changelog
question. An explicit request to edit the changelog can be carried out directly.
