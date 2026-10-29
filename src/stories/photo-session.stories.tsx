import type { Meta, StoryObj } from '@storybook/react-vite';
import App from '../App';
import wildlifeUrl from '../../tests/fixtures/20260520-IMG_3843.jpg';
import portraitUrl from '../../tests/fixtures/20261021-IMG_0469.jpg';
import macroUrl from '../../tests/fixtures/20261021-IMG_9959.jpg';

const meta = {
  title: 'Photo session/Full session',
  component: App,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof App>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const ImportedSeries: Story = {
  play: async ({ canvasElement }) => {
    const files = await Promise.all(
      [
        [wildlifeUrl, '20260520-IMG_3843.jpg'],
        [portraitUrl, '20261021-IMG_0469.jpg'],
        [macroUrl, '20261021-IMG_9959.jpg'],
      ].map(
        async ([url, name]) =>
          new File([await (await fetch(url!)).blob()], name!, {
            type: 'image/jpeg',
          }),
      ),
    );
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[type="file"][multiple]',
    );
    if (!input) throw Error('The session photo input was not mounted.');
    const transfer = new DataTransfer();
    for (const file of files) transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  },
};
