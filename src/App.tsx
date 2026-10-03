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
import { CustomDropdown } from './components/CustomDropdown';

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

  function handleIntegerBitsChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const value = e.target.value;
    if (value === '' || (/^\d+$/u).test(value)) {
      setIntegerBitsString(value);
    }
  }

  function handleFractionalBitsChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const value = e.target.value;
    if (value === '' || (/^\d+$/u).test(value)) {
      setFractionalBitsString(value);
    }
  }

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
              Integer Bits (including sign bit):
            </CustomLabel>

            <CustomInput
              id="integerBits"
              inputMode="numeric"
              onChange={handleIntegerBitsChange}
              placeholder="Integer Bits"
              type="text"
              value={integerBitsString}
            />
          </InputWithLabelContainer>

          <InputWithLabelContainer>
            <CustomLabel htmlFor="fractionalBits">
              Fractional Bits:
            </CustomLabel>

            <CustomInput
              id="fractionalBits"
              inputMode="numeric"
              onChange={handleFractionalBitsChange}
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
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  setIsSigned(!isSigned);
                }
              }}
            >
              <span>
                {isSigned ? 'Signed (Twos Complement)' : 'Unsigned'}
              </span>
            </CustomToggle>
          </div>

          <InputWithLabelContainer>
            <CustomLabel htmlFor="inputType">Input Type</CustomLabel>

            <CustomDropdown<InputFormatType>
              getOptionLabel={
                (option: InputFormatType) => {
                  return Object.entries(InputFormat).find(
                    ([, value]) => {
                      return value === option;
                    },
                  )?.[0] ?? '';
                }
              }
              onChange={(newValue: InputFormatType) => {
                setInputType(newValue);
              }}
              options={Object.values(InputFormat)}
              value={inputType}
            />
          </InputWithLabelContainer>

          <InputWithLabelContainer>
            <CustomLabel htmlFor="inputString">
              {isSigned
                ? 'Fixed-Point Number (Twos Complement):'
                : 'Fixed-Point Number (Unsigned)'}
            </CustomLabel>

            <CustomInput
              id="inputString"
              inputMode="numeric"
              onChange={(e) => {
                setInputString(e.target.value);
              }}
              placeholder="Enter Fixed-Point Number"
              type="text"
              value={inputString}
            />
          </InputWithLabelContainer>

          {outcome.status === 'success'
            ? <ResultDisplay result={outcome.result} />
            : null}

          {outcome.status === 'invalid'
            ? <ErrorDisplay error={outcome.message} />
            : null}

        </div>
      </main>

      <CustomFooter />
    </div>
  );
}

export default App;
