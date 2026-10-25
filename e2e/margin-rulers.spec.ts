import { expect, test } from '@playwright/test';
import { wildlifeFixture } from '../tests/fixtures.ts';

test('drags large labeled margin handles with linked edges, cancellation and keyboard control', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Choose JPG photo').setInputFiles(wildlifeFixture.path);
  const left = page.getByRole('slider', { name: 'Left margin', exact: true });
  const right = page.getByRole('slider', { name: 'Right margin', exact: true });
  const field = (name: string) =>
    page.getByRole('spinbutton', { name, exact: true });
  const mode = (name: string) =>
    page
      .getByRole('radiogroup', { name: 'Margin linking' })
      .getByRole('radio', { name, exact: true });
  await left.hover();
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  const box = (await left.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(28);
  expect(box.height).toBeGreaterThanOrEqual(28);
  // Grab outside the visible badge, inside the larger handle area.
  await page.mouse.move(box.x + box.width / 2 + 12, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 52, box.y + box.height / 2, {
    steps: 5,
  });
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await page.mouse.up();
  expect(Number(await field('Left').inputValue())).toBeGreaterThan(3);
  await expect(field('Right')).toHaveValue('3');

  await field('Left').fill('3');
  await mode('Paired').click();
  const r = (await right.boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2 - 30, r.y + r.height / 2, {
    steps: 5,
  });
  expect(Number(await field('Right').inputValue())).toBeGreaterThan(3);
  await expect(field('Left')).toHaveValue(await field('Right').inputValue());
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(field('Right')).toHaveValue('3');
  await expect(field('Left')).toHaveValue('3');

  await mode('Linked').click();
  await left.focus();
  await left.press('ArrowRight');
  for (const name of ['Left', 'Right', 'Top', 'Bottom'])
    await expect(field(name)).toHaveValue('3.1');
  await right.focus();
  await right.press('ArrowRight');
  for (const name of ['Left', 'Right', 'Top', 'Bottom'])
    await expect(field(name)).toHaveValue('3');
  await field('Left').fill('8');
  await page.getByRole('button', { name: 'Reset margins' }).click();
  for (const name of ['Left', 'Right', 'Top', 'Bottom'])
    await expect(field(name)).toHaveValue('3');
  await expect(mode('Linked')).toBeChecked();
});
