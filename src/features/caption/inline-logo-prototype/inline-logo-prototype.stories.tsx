import type { Meta, StoryObj } from '@storybook/react-vite';
import { InlineLogoPrototype } from './inline-logo-prototype';

const meta = {
  title: 'Screens/InlineLogoPrototype',
  component: InlineLogoPrototype,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof InlineLogoPrototype>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Mixed: Story = {};
export const BetweenTags: Story = { args: { example: 'between-tags' } };
export const OwnLine: Story = { args: { example: 'own-line' } };
export const LogoOnly: Story = { args: { example: 'logo-only' } };
export const RasterLogoOnly: Story = {
  args: { example: 'logo-only', logoFormat: 'png' },
};
export const RasterLightBackground: Story = {
  args: { example: 'logo-only', logoFormat: 'png', light: true },
};
export const LightBackground: Story = { args: { light: true } };
