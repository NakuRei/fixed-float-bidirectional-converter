import { useState } from 'react';

import { CustomHeader } from './components/CustomHeader';
import { CustomFooter } from './components/CustomFooter';
import { CustomInput } from './components/CustomInput';
import { CustomSelect } from './components/CustomSelect';
import { CustomLabel } from './components/CustomLabel';
import { CustomToggle } from './components/CustomToggle';
import { InputWithLabelContainer } from './components/InputWithLabelContainer';
import { ConversionOutput } from './components/ConversionOutput';
import { InputFormat, type InputFormatType } from './conversion/InputFormat';
import { RoundingMode, type RoundingModeType } from './conversion/RoundingMode';

import {
  convertFixedPoint,
  type ConversionInput,
} from './conversion/convertFixedPoint';

const inputInstructions = {
  [InputFormat.Binary]: {
    label: 'Fixed-Point Bit Pattern:',
    placeholder: 'Enter Fixed-Point Number',
    inputMode: 'numeric',
    hint: 'Use 0 or 1, optionally prefixed with 0b. No separators.',
  },
  [InputFormat.Decimal]: {
    label: 'Decimal Value:',
    placeholder: 'Enter Decimal Number',
    inputMode: 'text',
    hint: 'Enter a decimal value, such as -3.1875 or 1.25e-1.',
  },
  [InputFormat.Hexadecimal]: {
    label: 'Fixed-Point Bit Pattern:',
    placeholder: 'Enter Fixed-Point Number',
    inputMode: 'text',
    hint: 'Use 0–9, A–F or a–f, optionally prefixed with 0x. '
      + 'No separators.',
  },
} as const;

function App(): React.JSX.Element {
  const [integerBitsString, setIntegerBitsString] = useState<string>('4');
  const [fractionalBitsString, setFractionalBitsString] = useState<string>('4');
  const [isSigned, setIsSigned] = useState<boolean>(true);
  const [inputType, setInputType] = useState<InputFormatType>(
    InputFormat.Binary,
  );
  const [inputString, setInputString] = useState<string>('');
  const [roundingMode, setRoundingMode] = useState<RoundingModeType>(
    RoundingMode.NearestEven,
  );
  const instructions = inputInstructions[inputType];

  const conversionInput: ConversionInput = inputType === InputFormat.Decimal
    ? {
      inputString,
      isSigned,
      integerBitsString,
      fractionalBitsString,
      inputType,
      roundingMode,
    }
    : {
      inputString,
      isSigned,
      integerBitsString,
      fractionalBitsString,
      inputType,
    };
  const outcome = convertFixedPoint(conversionInput);

  const invalidFields = outcome.status === 'invalid'
    ? outcome.invalidFields
    : [];
  const isIntegerBitsInvalid = invalidFields.includes('integerBitsString');
  const isFractionalBitsInvalid = invalidFields
    .includes('fractionalBitsString');
  const isInputStringInvalid = invalidFields.includes('inputString');

  return (
    <div
      className={['w-full h-svh', 'grid grid-rows-[auto_1fr]'].join(' ')}
    >
      <CustomHeader />

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
          <InputWithLabelContainer>
            <CustomLabel htmlFor="integerBits">
              Integer Bits:
            </CustomLabel>

            <CustomInput
              aria-describedby={isIntegerBitsInvalid
                ? 'integerBitsHint conversionError'
                : 'integerBitsHint'}
              aria-invalid={isIntegerBitsInvalid}
              id="integerBits"
              inputMode="numeric"
              onChange={(e) => {
                setIntegerBitsString(e.target.value);
              }}
              placeholder="Integer Bits"
              type="text"
              value={integerBitsString}
            />

            <p
              className="text-sm text-on-background"
              id="integerBitsHint"
            >
              Includes the sign bit when signed.
            </p>
          </InputWithLabelContainer>

          <InputWithLabelContainer>
            <CustomLabel htmlFor="fractionalBits">
              Fractional Bits:
            </CustomLabel>

            <CustomInput
              aria-describedby={isFractionalBitsInvalid
                ? 'conversionError'
                : undefined}
              aria-invalid={isFractionalBitsInvalid}
              id="fractionalBits"
              inputMode="numeric"
              onChange={(e) => {
                setFractionalBitsString(e.target.value);
              }}
              placeholder="Fractional Bits"
              type="text"
              value={fractionalBitsString}
            />
          </InputWithLabelContainer>

          <div className="w-full h-fit">
            <CustomToggle
              checked={isSigned}
              id="isSignedToggle"
              onChange={(e) => {
                setIsSigned(e.target.checked);
              }}
            >
              Signed (two&apos;s complement)
            </CustomToggle>
          </div>

          <InputWithLabelContainer>
            <CustomLabel htmlFor="inputType">Input Type</CustomLabel>

            <CustomSelect
              id="inputType"
              onChange={(e) => {
                const selectedFormat = Object.values(InputFormat)
                  .find((format) => format === Number(e.target.value));
                if (selectedFormat !== undefined) {
                  setInputType(selectedFormat);
                }
              }}
              value={inputType}
            >
              {Object.entries(InputFormat).map(([label, value]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </CustomSelect>
          </InputWithLabelContainer>

          {inputType === InputFormat.Decimal
            ? (
              <InputWithLabelContainer>
                <CustomLabel htmlFor="roundingMode">
                  Fixed-point rounding
                </CustomLabel>

                <CustomSelect
                  aria-describedby="roundingHint"
                  id="roundingMode"
                  onChange={(e) => {
                    const mode = e.target.value;
                    if (mode === RoundingMode.NearestEven
                      || mode === RoundingMode.TowardZero
                      || mode === RoundingMode.Exact) {
                      setRoundingMode(mode);
                    }
                  }}
                  value={roundingMode}
                >
                  <option value={RoundingMode.NearestEven}>
                    Nearest (ties to even)
                  </option>

                  <option value={RoundingMode.TowardZero}>
                    Toward zero (truncate)
                  </option>

                  <option value={RoundingMode.Exact}>Exact only</option>
                </CustomSelect>

                <p
                  className="text-sm text-on-background"
                  id="roundingHint"
                >
                  Values outside the fixed-point range are rejected.
                  {' '}
                  Exact only rejects precision loss in fixed-point
                  conversion.
                </p>
              </InputWithLabelContainer>
            )
            : null}

          <InputWithLabelContainer>
            <CustomLabel htmlFor="inputString">
              {instructions.label}
            </CustomLabel>

            <CustomInput
              aria-describedby={isInputStringInvalid
                ? 'inputStringHint conversionError'
                : 'inputStringHint'}
              aria-invalid={isInputStringInvalid}
              id="inputString"
              inputMode={instructions.inputMode}
              onChange={(e) => {
                setInputString(e.target.value);
              }}
              placeholder={instructions.placeholder}
              type="text"
              value={inputString}
            />

            <p
              className="text-sm text-on-background"
              id="inputStringHint"
            >
              {instructions.hint}
            </p>
          </InputWithLabelContainer>

          <ConversionOutput
            outcome={outcome}
          />
        </div>
      </main>

      <CustomFooter />
    </div>
  );
}

export default App;
