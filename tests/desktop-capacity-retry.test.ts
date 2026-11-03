import { expect, it, vi } from 'vitest';
// @ts-expect-error CI helper is plain JavaScript.
import { retryDesktopCapacity } from '../scripts/retry-desktop-capacity.mjs';
function setup() {
  const run = {
    id: 10,
    status: 'completed',
    event: 'push',
    path: '.github/workflows/desktop-release.yml',
    head_repository: { full_name: 'owner/repo' },
    run_attempt: 1,
    conclusion: 'failure',
    html_url: 'https://example.test/run',
  };
  const jobs = [
    'validate',
    'build (windows-2022, windows-x64)',
    'build (ubuntu-24.04, linux-x64)',
  ].map((name, id) => ({ id, name, conclusion: 'success', steps: [] }));
  jobs.push({
    id: 4,
    name: 'build (macos-15, mac-arm64)',
    conclusion: 'cancelled',
    steps: [],
    check_run_url: 'https://api.github.com/repos/owner/repo/check-runs/4',
  } as (typeof jobs)[number]);
  const annotations = [
    {
      message:
        'The job was not acquired by Runner of type hosted even after multiple attempts',
    },
  ];
  const github = {
    rest: {
      actions: {
        getWorkflowRun: vi.fn().mockResolvedValue({ data: run }),
        listJobsForWorkflowRun: vi.fn(),
        reRunWorkflowFailedJobs: vi.fn(),
      },
      checks: { listAnnotations: vi.fn() },
    },
    paginate: vi
      .fn()
      .mockImplementation((method) =>
        Promise.resolve(
          method === github.rest.checks.listAnnotations ? annotations : jobs,
        ),
      ),
  };
  const summary = {
    addHeading: vi.fn().mockReturnThis(),
    addLink: vi.fn().mockReturnThis(),
    write: vi.fn(),
  };
  return {
    run,
    jobs,
    annotations,
    github,
    context: {
      repo: { owner: 'owner', repo: 'repo' },
      payload: { workflow_run: { id: 10, run_attempt: 1 } },
    },
    core: { info: vi.fn(), warning: vi.fn(), summary },
    pause: vi.fn(),
  };
}
it('waits and retries only failed jobs after an allocation failure', async () => {
  const s = setup();
  await retryDesktopCapacity(s);
  expect(s.pause).toHaveBeenCalledWith(300000);
  expect(s.github.rest.actions.reRunWorkflowFailedJobs).toHaveBeenCalledWith({
    owner: 'owner',
    repo: 'repo',
    run_id: 10,
  });
});
it('stops after four total attempts', async () => {
  const s = setup();
  s.run.run_attempt = 4;
  s.context.payload.workflow_run.run_attempt = 4;
  await retryDesktopCapacity(s);
  expect(s.github.rest.actions.reRunWorkflowFailedJobs).not.toHaveBeenCalled();
});
it('does not retry an application step failure', async () => {
  const s = setup();
  s.jobs[3]!.steps.push({ conclusion: 'failure' } as never);
  await retryDesktopCapacity(s);
  expect(s.pause).not.toHaveBeenCalled();
});
it('does not treat a capacity warning as proof of allocation failure', async () => {
  const s = setup();
  s.annotations[0]!.message = 'Due to capacity constraints, jobs may wait';
  await retryDesktopCapacity(s);
  expect(s.pause).not.toHaveBeenCalled();
});
it('does not repeat a run manually restarted during the delay', async () => {
  const s = setup();
  s.pause.mockImplementation(async () => {
    s.run.status = 'queued';
  });
  await retryDesktopCapacity(s);
  expect(s.github.rest.actions.reRunWorkflowFailedJobs).not.toHaveBeenCalled();
});
it('does not retry unrelated failures', async () => {
  const s = setup();
  s.jobs[1]!.conclusion = 'failure';
  await retryDesktopCapacity(s);
  expect(s.pause).not.toHaveBeenCalled();
});

it.each([
  'build (macos-15, mac-arm64)',
  'build (windows-2022, windows-x64)',
  'build (ubuntu-24.04, linux-x64)',
  'validate',
  'release',
])('retries an allocation failure for %s', async (name) => {
  const s = setup();
  s.jobs[3]!.name = name;
  await retryDesktopCapacity(s);
  expect(s.github.rest.actions.reRunWorkflowFailedJobs).toHaveBeenCalledOnce();
});
it('retries multiple unavailable systems together', async () => {
  const s = setup();
  Object.assign(s.jobs[1]!, {
    conclusion: 'cancelled',
    check_run_url: 'https://api.github.com/repos/owner/repo/check-runs/2',
  });
  await retryDesktopCapacity(s);
  expect(s.github.rest.actions.reRunWorkflowFailedJobs).toHaveBeenCalledOnce();
});
it('does not retry mixed capacity and application failures', async () => {
  const s = setup();
  s.jobs[1]!.conclusion = 'failure';
  s.jobs[1]!.steps.push({ conclusion: 'failure' } as never);
  await retryDesktopCapacity(s);
  expect(s.pause).not.toHaveBeenCalled();
});
