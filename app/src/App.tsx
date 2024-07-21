import { useState, useEffect } from 'react';

import { CustomHeader } from './components/CustomHeader';
import { CustomFooter } from './components/CustomFooter';
import { CustomInput } from './components/CustomInput';
import { CustomLabel } from './components/CustomLabel';
import { InputWithLabelContainer } from './components/InputWithLabelContainer';

import { convertTwosComplementBinary2Floating } from './utils/convertTwosComplement2Floating';

function App(): JSX.Element {
  const [binaryString, setBinaryString] = useState<string>('');
  const [integerBits, setIntegerBits] = useState<string>('4');
  const [fractionalBits, setFractionalBits] = useState<string>('4');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleIntegerBitsChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setIntegerBits(value);
    }
  }

  function handleFractionalBitsChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setFractionalBits(value);
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
        const floatValue = convertTwosComplementBinary2Floating(
          binaryString,
          parseInt(integerBits),
          parseInt(fractionalBits),
        );
        setResult(floatValue);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred',
        );
        setResult(null);
      }
    }

    convert();
  }, [binaryString, integerBits, fractionalBits]);

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
              'gap-8',
              'px-12 sm:px-24 py-12',
            ].join(' ')}
          >
            <h1 className="text-2xl font-bold">Binary to Float Converter</h1>
            <InputWithLabelContainer>
              <CustomLabel htmlFor="integerBits">
                Integer Bits (including sign bit):
              </CustomLabel>
              <CustomInput
                id="integerBits"
                type="text"
                inputMode="numeric"
                value={integerBits}
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
                value={fractionalBits}
                placeholder="Fractional Bits"
                onChange={handleFractionalBitsChange}
              />
            </InputWithLabelContainer>
            <InputWithLabelContainer>
              <CustomLabel htmlFor="binaryString">
                Fixed-Point Number (Twos Complement):
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
                ].join(' ')}
              >
                <p className="text-sm">Result:</p>
                <p className="text-xl font-bold">{result}</p>
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
