import { useState, useEffect } from 'react';

import { CustomHeader } from './components/CustomHeader';
import { CustomFooter } from './components/CustomFooter';
import { CustomInput } from './components/CustomInput';
import { CustomLabel } from './components/CustomLabel';
import { CustomToggle } from './components/CustomToggle';
import { InputWithLabelContainer } from './components/InputWithLabelContainer';
import { ResultDisplay } from './components/ResultDisplay';
import { ErrorDisplay } from './components/ErrorDisplay';

import {
  signedBinaryConverters,
  unsignedBinaryConverters,
} from './utils/converters/convertersInstances';
import type { ConversionResults } from './types/ConversionResults';

function App(): React.JSX.Element {
  const [integerBitsString, setIntegerBitsString] = useState<string>('4');
  const [fractionalBitsString, setFractionalBitsString] = useState<string>('4');
  const [isSigned, setIsSigned] = useState<boolean>(true);
  const [binaryString, setBinaryString] = useState<string>('');
  const [result, setResult] = useState<ConversionResults | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    function convert(): void {
      if (!binaryString) {
        setResult(null);
        setError(null);
        return;
      }

      try {
        const integerBits = parseInt(integerBitsString, 10);
        const fractionalBits = parseInt(fractionalBitsString, 10);

        const converters = isSigned
          ? signedBinaryConverters
          : unsignedBinaryConverters;

        const conversionResults = converters.convert(
          binaryString,
          integerBits,
          fractionalBits,
        );
        setResult(conversionResults);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred',
        );
        setResult(null);
      }
    }

    convert();
  }, [binaryString, integerBitsString, fractionalBitsString, isSigned]);

  return (
    <>
      <div
        className={['w-full h-[100svh]', 'grid grid-rows-[auto_1fr]'].join(' ')}
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
              <CustomLabel htmlFor="binaryString">
                {isSigned
                  ? 'Fixed-Point Number (Twos Complement):'
                  : 'Fixed-Point Number (Unsigned)'}
              </CustomLabel>

              <CustomInput
                id="binaryString"
                inputMode="numeric"
                onChange={(e) => {
                  setBinaryString(e.target.value);
                }}
                placeholder="Enter Fixed-Point Number"
                type="text"
                value={binaryString}
              />
            </InputWithLabelContainer>

            <ResultDisplay result={result} />
            <ErrorDisplay error={error} />

          </div>
        </main>

        <CustomFooter />
      </div>
    </>
  );
}

export default App;
