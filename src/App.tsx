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

const inputFormatPresentation = {
  [InputFormat.Binary]: {
    optionLabel: 'Binary',
    inputLabel: 'Fixed-Point Bit Pattern:',
    placeholder: 'Enter Fixed-Point Number',
    inputMode: 'numeric',
    hint: 'Use 0 or 1, optionally prefixed with 0b. No separators.',
  },
  [InputFormat.Decimal]: {
    optionLabel: 'Decimal',
    inputLabel: 'Decimal Value:',
    placeholder: 'Enter Decimal Number',
    inputMode: 'text',
    hint: 'Enter a decimal value, such as -3.1875 or 1.25e-1.',
  },
  [InputFormat.Hexadecimal]: {
    optionLabel: 'Hexadecimal',
    inputLabel: 'Fixed-Point Bit Pattern:',
    placeholder: 'Enter Fixed-Point Number',
    inputMode: 'text',
    hint: 'Use 0–9, A–F or a–f, optionally prefixed with 0x. '
      + 'No separators.',
  },
} as const;

const roundingModeLabels = {
  [RoundingMode.NearestEven]: 'Nearest (ties to even)',
  [RoundingMode.TowardZero]: 'Toward zero (truncate)',
  [RoundingMode.Exact]: 'Exact only',
} as const;

function App(): React.JSX.Element {
  const [integerBitsString, setIntegerBitsString] = useState<string>('4');
  const [fractionalBitsString, setFractionalBitsString] = useState<string>('4');
  const [isSigned, setIsSigned] = useState<boolean>(true);
  const [inputFormat, setInputFormat] = useState<InputFormatType>(
    InputFormat.Binary,
  );
  const [inputString, setInputString] = useState<string>('');
  const [roundingMode, setRoundingMode] = useState<RoundingModeType>(
    RoundingMode.NearestEven,
  );
  const presentation = inputFormatPresentation[inputFormat];

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
            <CustomLabel htmlFor="inputFormat">Input Format</CustomLabel>

            <CustomSelect
              id="inputFormat"
              onChange={(e) => {
                const selectedFormat = Object.values(InputFormat)
                  .find((format) => format === e.target.value);
                if (selectedFormat !== undefined) {
                  setInputFormat(selectedFormat);
                }
              }}
              value={inputFormat}
            >
              {Object.values(InputFormat).map((format) => (
                <option
                  key={format}
                  value={format}
                >
                  {inputFormatPresentation[format].optionLabel}
                </option>
              ))}
            </CustomSelect>
          </InputWithLabelContainer>

          {inputFormat === InputFormat.Decimal
            ? (
              <InputWithLabelContainer>
                <CustomLabel htmlFor="roundingMode">
                  Fixed-point rounding
                </CustomLabel>

                <CustomSelect
                  aria-describedby="roundingHint"
                  id="roundingMode"
                  onChange={(e) => {
                    const selectedMode = Object.values(RoundingMode)
                      .find((mode) => mode === e.target.value);
                    if (selectedMode !== undefined) {
                      setRoundingMode(selectedMode);
                    }
                  }}
                  value={roundingMode}
                >
                  {Object.values(RoundingMode).map((mode) => (
                    <option
                      key={mode}
                      value={mode}
                    >
                      {roundingModeLabels[mode]}
                    </option>
                  ))}
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
              {presentation.inputLabel}
            </CustomLabel>

            <CustomInput
              aria-describedby={isInputStringInvalid
                ? 'inputStringHint conversionError'
                : 'inputStringHint'}
              aria-invalid={isInputStringInvalid}
              id="inputString"
              inputMode={presentation.inputMode}
              onChange={(e) => {
                setInputString(e.target.value);
              }}
              placeholder={presentation.placeholder}
              type="text"
              value={inputString}
            />

            <p
              className="text-sm text-on-background"
              id="inputStringHint"
            >
              {presentation.hint}
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
