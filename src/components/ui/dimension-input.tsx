import { NumberInput, type NumberInputProps } from './number-input';

export interface DimensionInputProps extends Omit<NumberInputProps, 'suffix'> {
  /** Display-only unit; the document chooses its measurement basis globally. */
  unit: string;
}

export function DimensionInput({ unit, ...props }: DimensionInputProps) {
  return <NumberInput {...props} suffix={unit} />;
}
