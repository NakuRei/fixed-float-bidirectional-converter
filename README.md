# Fixed-Float Bidirectional Converter

[English](README.md) / [日本語](README.ja.md)

A web app that converts between fixed-point and floating-point numbers.

Live site: https://nakurei.github.io/fixed-float-bidirectional-converter/

## Features

Specify the integer and fractional bit counts of a fixed-point number to convert its binary or hexadecimal notation to a floating-point number. Bit pattern input may include a `0b`/`0x` prefix. Separators are not allowed.

You can also convert a floating-point number to a fixed-point number of any bit length. Floating-point input accepts exponent notation such as `1.25e-1`.

Signed fixed-point numbers use two's complement, and the sign bit counts as an integer bit.

Converting a fixed-point number to a floating-point number rounds to the nearest representable value, with ties rounded to even. Converting a floating-point number to a fixed-point number uses one of the following rounding modes:

- Nearest (ties to even / ties away from zero / ties toward +∞)
- Toward zero (truncate)
- Toward −∞ (floor)
- Toward +∞ (ceiling)
- Exact only (values that need rounding are rejected)

When a value is outside the fixed-point range, you can choose one of the following:

- Error
- Saturate
- Wrap

In the row for the format you entered, your input is shown as entered, labeled `original`.

## Usage

1. Set the integer and fractional bit counts.
1. Use the toggle to choose signed or unsigned.
1. Select the input format and enter a value.
1. The conversion results appear.

For example, here is a conversion in the signed Q4.4 format:

| Input | Hexadecimal | Binary | Decimal |
| --- | --- | --- | --- |
| `11001101` (binary) | `CD` | `11001101` | `-3.1875` |

## Development

Requires Node.js 24.

```sh
npm ci
npm run dev      # Start the dev server
npm test         # Run tests
npm run lint     # Run ESLint
npm run verify   # Run lint, tests, and build
```

## License

© 2024 NakuRei
