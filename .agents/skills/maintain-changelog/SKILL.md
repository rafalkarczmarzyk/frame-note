---
name: maintain-changelog
description: Maintain the FrameNote changelog automatically when committing a completed task or an iterated solution, or when explicitly asked. Exclude intermediate checkpoints and routine documentation or configuration edits.
---

# Maintain changelog — FrameNote

When the user requests a commit of a completed task or an iterated solution,
update the root `CHANGELOG.md` while preparing that commit, without separate
confirmation. A formal plan is not required. Explicit changelog requests can
also be carried out directly.

- Finish authorized changes and relevant verification, then inspect the intended
  commit diff and existing changelog entries.
- Record notable features, fixes, behavior changes, and compatibility changes
  in concise English under the current Unreleased section, using Added,
  Changed, Fixed, or Removed as appropriate. Describe resulting behavior,
  not implementation attempts.
- Refine existing entries for the same result instead of duplicating them
  across iterations or follow-up commits. Preserve unrelated entries.
- Skip intermediate checkpoints, routine documentation or configuration edits,
  cosmetic maintenance, and changes to this skill alone. Do not add filler
  when existing entries already cover the result.
- Respect explicit instructions to skip the changelog for a given result.
  Ask only when material ambiguity cannot be resolved from the diff and
  conversation. Ordinary entry wording does not require approval.
- Check formatting and the final diff, include the update in the authorized
  commit, and briefly report the update or why no entry was needed.

Implementation without a commit request does not trigger an automatic update.
This skill does not authorize commits. A commit does not mean user acceptance,
completion of a product stage, or a release. Do not bump versions, create release
sections or tags, publish, or advance stages without a separate instruction.
