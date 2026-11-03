// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import { setTimeout as delay } from 'node:timers/promises';
import { URL } from 'node:url';
// Only retry runner allocation failures; never execute code from the failed run.
export async function retryDesktopCapacity({
  github,
  context,
  core,
  pause = delay,
}) {
  const repo = context.repo;
  const eventRun = context.payload.workflow_run;
  const { data: run } = await github.rest.actions.getWorkflowRun({
    ...repo,
    run_id: eventRun.id,
  });
  if (
    run.status !== 'completed' ||
    run.event !== 'push' ||
    run.path !== '.github/workflows/desktop-release.yml' ||
    run.head_repository?.full_name !== `${repo.owner}/${repo.repo}` ||
    run.run_attempt !== eventRun.run_attempt ||
    !['failure', 'cancelled'].includes(run.conclusion)
  )
    return;
  if (run.run_attempt >= 4) {
    core.warning(
      'Runner retry limit reached (4 total attempts). Manual review required.',
    );
    return;
  }
  const jobs = await github.paginate(
    github.rest.actions.listJobsForWorkflowRun,
    { ...repo, run_id: run.id, filter: 'latest', per_page: 100 },
  );
  const failed = jobs.filter((job) =>
    ['failure', 'cancelled', 'timed_out'].includes(job.conclusion),
  );
  if (!failed.length) return;
  const knownJobs = new Set([
    'validate',
    'release',
    'source',
    'build (macos-15, mac-arm64)',
    'build (windows-2022, windows-x64)',
    'build (ubuntu-24.04, linux-x64)',
  ]);
  for (const job of failed) {
    if (
      !knownJobs.has(job.name) ||
      !job.check_run_url ||
      job.steps?.some((step) => step.conclusion === 'failure')
    )
      return;
    const check_run_id = Number(
      new URL(job.check_run_url).pathname.split('/').pop(),
    );
    const annotations = await github.paginate(
      github.rest.checks.listAnnotations,
      { ...repo, check_run_id, per_page: 100 },
    );
    // Every failed job must have a confirmed allocation failure. A capacity warning alone is insufficient.
    if (
      !annotations.some((a) =>
        /job was not acquired by Runner of type hosted/i.test(a.message),
      )
    )
      return;
  }
  core.info(
    'Runner unavailable; waiting five minutes before retrying failed jobs.',
  );
  await pause(300000);
  const { data: latest } = await github.rest.actions.getWorkflowRun({
    ...repo,
    run_id: run.id,
  });
  if (latest.status !== 'completed' || latest.run_attempt !== run.run_attempt)
    return;
  await github.rest.actions.reRunWorkflowFailedJobs({
    ...repo,
    run_id: run.id,
  });
  await core.summary
    .addHeading('Desktop runner retry')
    .addLink(`Retry ${run.run_attempt + 1}/4`, run.html_url)
    .write();
}
