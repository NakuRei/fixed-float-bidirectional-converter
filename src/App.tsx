import { useState } from 'react';

import { CustomHeader } from './components/CustomHeader';
import { CustomFooter } from './components/CustomFooter';
import { CustomInput } from './components/CustomInput';
import { CustomLabel } from './components/CustomLabel';
import { CustomToggle } from './components/CustomToggle';
import { InputWithLabelContainer } from './components/InputWithLabelContainer';
import { ResultDisplay } from './components/ResultDisplay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { InputFormat, type InputFormatType } from './constants/InputFormat';

import { convertFixedPoint } from './utils/convertFixedPoint';

function App(): React.JSX.Element {
  const [integerBitsString, setIntegerBitsString] = useState<string>('4');
  const [fractionalBitsString, setFractionalBitsString] = useState<string>('4');
  const [isSigned, setIsSigned] = useState<boolean>(true);
  const [inputType, setInputType] = useState<InputFormatType>(
    InputFormat.Binary,
  );
  const [inputString, setInputString] = useState<string>('');

  const outcome = convertFixedPoint({
    inputString,
    inputType,
    isSigned,
    integerBitsString,
    fractionalBitsString,
  });

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
          <h1 className="text-2xl font-bold">
            Fixed-Float Bidirectional Converter
          </h1>

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

            <select
              className={[
                'w-full h-fit',
                'px-4 py-2',
                'rounded-md',
                'border-2 border-primary-700',
                'bg-primary-container/20 text-on-background',
                'scheme-dark cursor-pointer',
                'focus:border-on-primary-container focus:outline-hidden',
                'focus:shadow-lg focus:shadow-on-primary-container/20',
                'focus:bg-background-950',
                'focus:ring-2 focus:ring-primary-700/20',
                'transition duration-300 focus:duration-0 ease-in-out',
              ].join(' ')}
              id="inputType"
              onChange={(e) => {
                const selectedFormat = Number(e.target.value);
                if (selectedFormat === InputFormat.Binary
                  || selectedFormat === InputFormat.Hexadecimal) {
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
            </select>
          </InputWithLabelContainer>

          <InputWithLabelContainer>
            <CustomLabel htmlFor="inputString">
              Fixed-Point Bit Pattern:
            </CustomLabel>

            <CustomInput
              aria-describedby={isInputStringInvalid
                ? 'inputStringHint conversionError'
                : 'inputStringHint'}
              aria-invalid={isInputStringInvalid}
              id="inputString"
              inputMode={inputType === InputFormat.Binary ? 'numeric' : 'text'}
              onChange={(e) => {
                setInputString(e.target.value);
              }}
              placeholder="Enter Fixed-Point Number"
              type="text"
              value={inputString}
            />

            <p
              className="text-sm text-on-background"
              id="inputStringHint"
            >
              {inputType === InputFormat.Binary
                ? 'Use 0 or 1, without a prefix or separators.'
                : 'Use 0–9, A–F or a–f, without 0x or separators.'}
            </p>
          </InputWithLabelContainer>

          {outcome.status === 'success'
            ? <ResultDisplay result={outcome.result} />
            : null}

          {outcome.status === 'invalid'
            ? (
              <ErrorDisplay
                error={outcome.message}
                id="conversionError"
              />
            )
            : null}

        </div>
      </main>

      <CustomFooter />
    </div>
  );
}

export default App;
