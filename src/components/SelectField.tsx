import { useId } from 'react';

import { Label } from './Label';
import { Select } from './Select';
import { InputWithLabelContainer } from './InputWithLabelContainer';

interface SelectFieldOption<Value extends string> {
  value: Value;
  label: string;
}

interface SelectFieldProps<Value extends string> {
  label: string;
  value: Value;
  options: readonly SelectFieldOption<Value>[];
  onValueChange: (value: Value) => void;
  hint?: string;
}

export function SelectField<Value extends string>({
  label,
  value,
  options,
  onValueChange,
  hint,
}: SelectFieldProps<Value>): React.JSX.Element {
  const selectId = useId();
  const hintId = useId();

  return (
    <InputWithLabelContainer>
      <Label htmlFor={selectId}>{label}</Label>

      <Select
        aria-describedby={hint === undefined ? undefined : hintId}
        id={selectId}
        onChange={(event) => {
          const selectedOption = options
            .find((option) => option.value === event.target.value);
          if (selectedOption !== undefined) {
            onValueChange(selectedOption.value);
          }
        }}
        value={value}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </Select>

      {hint === undefined
        ? null
        : (
          <p
            className="text-sm text-on-background"
            id={hintId}
          >
            {hint}
          </p>
        )}
    </InputWithLabelContainer>
  );
}
