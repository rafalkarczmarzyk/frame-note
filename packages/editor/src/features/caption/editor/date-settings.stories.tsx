import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaptionEditor } from './caption-editor';
import { createMetadataField } from '../../../../../core/src/metadata';
import { dateToken } from '../../../../../core/src/date-format';
const noop = () => {};
function DatePreview({ missing = false }: { missing?: boolean }) {
  const [value, setValue] = useState(`{${dateToken("'YY MM DD")}}`);
  return (
    <div className="w-80 bg-sidebar-base p-3 text-content-primary">
      <p className="mb-3 text-xs">
        Select the date to choose a format or apply a custom pattern.
      </p>
      <CaptionEditor
        value={value}
        onChange={setValue}
        fields={
          missing
            ? []
            : [
                createMetadataField({
                  group: 'exif',
                  name: 'DateTimeOriginal',
                  displayValue: '2026:11:06 12:00:00',
                  rawValue: null,
                }),
              ]
        }
        icons={[]}
        hasPhoto
        onFocus={noop}
        onBlur={noop}
        onReady={noop}
      />
    </div>
  );
}
const meta = {
  title: 'Pickers/DateFormat',
  component: DatePreview,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Capture-date formatting per token. Select a date to choose a preset or enter a validated year/month/day pattern. Missing metadata remains explicit.',
      },
    },
  },
} satisfies Meta<typeof DatePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CaptureDate: Story = {};
export const MissingDate: Story = { args: { missing: true } };
