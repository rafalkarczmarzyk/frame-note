import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Download, TriangleAlert } from 'lucide-react';
import { AppNotification, AppNotificationStack } from './app-notification';

function NotificationPreview() {
  const [warning, setWarning] = useState(true);
  const [update, setUpdate] = useState(true);
  const [settings, setSettings] = useState(false);
  return (
    <div className="relative h-96 bg-workspace-base text-content-primary">
      <AppNotificationStack>
        {warning && (
          <AppNotification
            role="alert"
            icon={<TriangleAlert aria-hidden="true" />}
            action={{
              label: 'Open Settings',
              onClick: () => setSettings(true),
            }}
            dismissLabel="Dismiss configuration notification"
            onDismiss={() => setWarning(false)}
          >
            Configuration could not be loaded. FrameNote is using defaults.
            Review Settings for details.
          </AppNotification>
        )}
        {update && (
          <AppNotification
            icon={<Download aria-hidden="true" />}
            dismissLabel="Dismiss update notification"
            onDismiss={() => setUpdate(false)}
          >
            FrameNote 1.0.0 is available
          </AppNotification>
        )}
      </AppNotificationStack>
      {settings && (
        <p className="absolute bottom-4 left-4">Settings action activated</p>
      )}
    </div>
  );
}

const meta = {
  title: 'Selection & feedback/AppNotification',
  component: NotificationPreview,
  parameters: {
    docs: {
      description: {
        component:
          'Application notifications share one workspace overlay stack below the toolbar. Messages wrap; each action and dismissal is independent. Full configuration diagnostics remain in Settings.',
      },
    },
  },
} satisfies Meta<typeof NotificationPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Stacked: Story = {};
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};
