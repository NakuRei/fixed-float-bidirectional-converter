import { useId, useState } from 'react';

import { AppHeader } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { SelectField } from './components/SelectField';
import { Toggle } from './components/Toggle';
import { TextField } from './components/TextField';
import { ConversionOutcomePanel } from './components/ConversionOutcomePanel';
import {
  InputFormat,
  RoundingMode,
  type InputFormatType,
  type RoundingModeType,
  type ConversionDiagnostic,
  type ConversionInput,
} from './conversion/contracts';

import { convertFixedPoint } from './conversion/convertFixedPoint';
import { inputFormatPresentation } from './inputFormatPresentation';

const inputFormatOptions = Object.values(InputFormat).map((format) => ({
  value: format,
  label: inputFormatPresentation[format].optionLabel,
}));

const roundingModeOptions: readonly {
  value: RoundingModeType;
  label: string;
}[] = [
  {
    value: RoundingMode.TiesToEven,
    label: 'Nearest, ties to even',
  },
  {
    value: RoundingMode.TiesToAway,
    label: 'Nearest, ties away from zero',
  },
  {
    value: RoundingMode.TiesToPositive,
    label: 'Nearest, ties toward +∞',
  },
  {
    value: RoundingMode.TowardZero,
    label: 'Toward zero',
  },
  {
    value: RoundingMode.TowardNegative,
    label: 'Toward −∞ (floor)',
  },
  {
    value: RoundingMode.TowardPositive,
    label: 'Toward +∞ (ceiling)',
  },
  {
    value: RoundingMode.Exact,
    label: 'Exact only (reject inexact)',
  },
];

function App(): React.JSX.Element {
  const [integerBitsString, setIntegerBitsString] = useState<string>('4');
  const [fractionalBitsString, setFractionalBitsString] = useState<string>('4');
  const [isSigned, setIsSigned] = useState<boolean>(true);
  const [inputFormat, setInputFormat] = useState<InputFormatType>(
    InputFormat.Binary,
  );
  const [inputString, setInputString] = useState<string>('');
  const [roundingMode, setRoundingMode] = useState<RoundingModeType>(
    RoundingMode.TiesToEven,
  );
  const presentation = inputFormatPresentation[inputFormat];
  const conversionErrorId = useId();

  const conversionInput: ConversionInput = inputFormat === InputFormat.Decimal
    ? {
      inputString,
      isSigned,
      integerBitsString,
      fractionalBitsString,
      inputFormat,
      roundingMode,
    }
    : {
      inputString,
      isSigned,
      integerBitsString,
      fractionalBitsString,
      inputFormat,
    };
  const outcome = convertFixedPoint(conversionInput);

  // includes() on the union of per-code field types accepts only never.
  const invalidFields: readonly ConversionDiagnostic['fields'][number][]
    = outcome.status === 'invalid'
      ? outcome.diagnostic.fields
      : [];
  const isIntegerBitsInvalid = invalidFields.includes('integerBitsString');
  const isFractionalBitsInvalid = invalidFields
    .includes('fractionalBitsString');
  const isInputStringInvalid = invalidFields.includes('inputString');

  return (
    <div
      className={['w-full h-svh', 'grid grid-rows-[auto_1fr]'].join(' ')}
    >
      <AppHeader />

      <main
        className={[
          'w-full max-w-[100vw] h-full',
          'px-12',
          'flex justify-center items-center',
          'bg-background',
          'text-on-background',
          'transition duration-500 ease-in-out',
        ].join(' ')}
      >
        <div
          className={[
            'w-full max-w-3xl h-full',
            'flex flex-col',
            'items-center justify-center',
            'gap-6',
            'px-0 sm:px-24 py-12',
          ].join(' ')}
        >
          <TextField
            errorId={conversionErrorId}
            hint="Includes the sign bit when signed."
            inputMode="numeric"
            invalid={isIntegerBitsInvalid}
            label="Integer Bits:"
            onChange={(e) => {
              setIntegerBitsString(e.target.value);
            }}
            placeholder="Integer Bits"
            value={integerBitsString}
          />

          <TextField
            errorId={conversionErrorId}
            inputMode="numeric"
            invalid={isFractionalBitsInvalid}
            label="Fractional Bits:"
            onChange={(e) => {
              setFractionalBitsString(e.target.value);
            }}
            placeholder="Fractional Bits"
            value={fractionalBitsString}
          />

          <div className="w-full h-fit">
            <Toggle
              checked={isSigned}
              onChange={(e) => {
                setIsSigned(e.target.checked);
              }}
            >
              Signed (two&apos;s complement)
            </Toggle>
          </div>

          <SelectField
            label="Input Format"
            onValueChange={setInputFormat}
            options={inputFormatOptions}
            value={inputFormat}
          />

          {inputFormat === InputFormat.Decimal
            ? (
              <SelectField
                hint={'Values whose rounded result is outside the '
                  + 'fixed-point range are rejected. Exact only rejects '
                  + 'precision loss in fixed-point conversion.'}
                label="Fixed-point rounding"
                onValueChange={setRoundingMode}
                options={roundingModeOptions}
                value={roundingMode}
              />
            )
            : null}

          <TextField
            errorId={conversionErrorId}
            hint={presentation.hint}
            inputMode={presentation.inputMode}
            invalid={isInputStringInvalid}
            label={presentation.inputLabel}
            onChange={(e) => {
              setInputString(e.target.value);
            }}
            placeholder={presentation.placeholder}
            value={inputString}
          />

          <ConversionOutcomePanel
            errorId={conversionErrorId}
            outcome={outcome}
          />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default App;
