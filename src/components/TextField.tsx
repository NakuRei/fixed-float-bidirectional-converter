import { useId } from 'react';

import { CustomInput } from './CustomInput';
import { CustomLabel } from './CustomLabel';
import { InputWithLabelContainer } from './InputWithLabelContainer';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  inputMode: 'numeric' | 'text';
  hint?: string;
  invalid: boolean;
  errorId: string;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  hint,
  invalid,
  errorId,
}: TextFieldProps): React.JSX.Element {
  const inputId = useId();
  const hintId = useId();
  const describedBy = [
    hint === undefined ? undefined : hintId,
    invalid ? errorId : undefined,
  ].filter((describingId) => describingId !== undefined).join(' ');

  return (
    <InputWithLabelContainer>
      <CustomLabel htmlFor={inputId}>{label}</CustomLabel>

      <CustomInput
        aria-describedby={describedBy === '' ? undefined : describedBy}
        aria-invalid={invalid}
        id={inputId}
        inputMode={inputMode}
        onChange={onChange}
        placeholder={placeholder}
        type="text"
        value={value}
      />

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
