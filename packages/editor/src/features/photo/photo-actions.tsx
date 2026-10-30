import { Trash2, X } from 'lucide-react';
import { PhotoIcon } from '@/components/icons/photo-icon';
import { SplitButton } from '@/components/ui/split-button';

export function PhotoActions({
  hasPhoto,
  loading = false,
  onOpen,
  onClose,
  photoCount = hasPhoto ? 1 : 0,
  onDisposeRoll,
}: {
  hasPhoto: boolean;
  loading?: boolean;
  onOpen: () => void;
  onClose: () => void;
  photoCount?: number;
  onDisposeRoll?: () => void;
}) {
  return (
    <SplitButton
      variant="outline"
      size="sm"
      aria-label="Add photos"
      menuLabel="Photo actions"
      primaryTooltip={'Add JPG or PNG photos to the session'}
      onClick={onOpen}
      disabled={loading}
      items={[
        {
          label: 'Close photo',
          icon: <X />,
          disabled: !hasPhoto,
          disabledReason: 'No photo is open',
          onSelect: onClose,
        },
        ...(onDisposeRoll
          ? [
              {
                label: 'Dispose roll…',
                icon: <Trash2 />,
                disabled: photoCount === 0,
                disabledReason: 'No photos are open',
                onSelect: onDisposeRoll,
              },
            ]
          : []),
      ]}
    >
      <PhotoIcon className="lg:hidden" />
      <span className="hidden lg:inline">Add photos</span>
    </SplitButton>
  );
}
