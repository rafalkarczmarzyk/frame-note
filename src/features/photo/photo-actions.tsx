import { X } from 'lucide-react';
import { PhotoIcon } from '@/components/icons/photo-icon';
import { SplitButton } from '@/components/ui/split-button';

export function PhotoActions({
  hasPhoto,
  loading = false,
  onOpen,
  onClose,
}: {
  hasPhoto: boolean;
  loading?: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <SplitButton
      variant="outline"
      size="sm"
      aria-label="Open photo"
      menuLabel="Photo actions"
      onClick={onOpen}
      disabled={loading}
      items={[
        {
          label: 'Close photo',
          icon: <X />,
          disabled: !hasPhoto,
          onSelect: onClose,
        },
      ]}
    >
      <PhotoIcon className="lg:hidden" />
      <span className="hidden lg:inline">Open photo</span>
    </SplitButton>
  );
}
