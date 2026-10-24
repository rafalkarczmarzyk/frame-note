import * as SliderPrimitive from '@radix-ui/react-slider';

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  id,
}: {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label: string;
  id?: string;
}) {
  return (
    <SliderPrimitive.Root
      id={id}
      value={[value]}
      onValueChange={(values) => {
        if (values[0] !== undefined) onValueChange(values[0]);
      }}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className="relative flex h-6 w-full touch-none select-none items-center data-[disabled]:opacity-50"
    >
      <SliderPrimitive.Track className="relative h-1 flex-1 rounded-full bg-secondary/40">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={label}
        className="block size-3 rounded-full bg-primary outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </SliderPrimitive.Root>
  );
}
