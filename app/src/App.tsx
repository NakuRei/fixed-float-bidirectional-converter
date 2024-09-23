import { useState, useEffect } from 'react';

import { CustomHeader } from './components/CustomHeader';
import { CustomFooter } from './components/CustomFooter';
import { CustomInput } from './components/CustomInput';
import { CustomLabel } from './components/CustomLabel';
import { CustomToggle } from './components/CustomToggle';
import { InputWithLabelContainer } from './components/InputWithLabelContainer';
import { LabeledResultDisplay } from './components/LabeledResultDisplay';

import {
  signedBinaryConverters,
  unsignedBinaryConverters,
} from './utils/converters/convertersInstances';
import { ConversionResults } from './types/ConversionResults';

function App(): JSX.Element {
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
    if (value === '' || /^\d+$/.test(value)) {
      setIntegerBitsString(value);
    }
  }

  function handleFractionalBitsChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
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
        const integerBits = parseInt(integerBitsString);
        const fractionalBits = parseInt(fractionalBitsString);

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
                type="text"
                inputMode="numeric"
                value={integerBitsString}
                placeholder="Integer Bits"
                onChange={handleIntegerBitsChange}
              />
            </InputWithLabelContainer>

            <InputWithLabelContainer>
              <CustomLabel htmlFor="fractionalBits">
                Fractional Bits:
              </CustomLabel>
              <CustomInput
                id="fractionalBits"
                type="text"
                inputMode="numeric"
                value={fractionalBitsString}
                placeholder="Fractional Bits"
                onChange={handleFractionalBitsChange}
              />
            </InputWithLabelContainer>

            <div className="w-full h-fit">
              <CustomToggle
                id="isSignedToggle"
                checked={isSigned}
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
                type="text"
                inputMode="numeric"
                value={binaryString}
                placeholder="Enter Fixed-Point Number"
                onChange={(e) => {
                  setBinaryString(e.target.value);
                }}
              />
            </InputWithLabelContainer>

            {result !== null && (
              <div
                className={[
                  'w-full h-fit',
                  'flex flex-col justify-start items-center',
                  'px-4 py-2',
                  'bg-primary-900 bg-opacity-40',
                  'text-on-background',
                  'overflow-x-auto',
                ].join(' ')}
              >
                <h2 className="text-xl font-bold mb-4">Result</h2>
                <LabeledResultDisplay
                  label="Hexadecimal:"
                  result={result.hexString}
                />
                <LabeledResultDisplay
                  label="Floating:"
                  result={result.floatString}
                />
                <LabeledResultDisplay
                  label="Binary:"
                  result={result.binaryString}
                />
              </div>
            )}
            {error && (
              <div
                className={[
                  'w-full h-fit',
                  'flex flex-col justify-start items-center',
                  'px-4 py-2',
                  'bg-error-container',
                  'text-error',
                ].join(' ')}
              >
                <p className="text-sm">ERROR:</p>
                <p className="text-base">{error}</p>
              </div>
            )}
          </div>
        </main>
        <CustomFooter />
      </div>
    </>
  );
}

export default App;
