import { Converters } from './Converters';

import { BinaryConverter } from '../binaryConverter/BinaryConverter';
import { BinaryToHexStrategy } from '../binaryConverter/strategy/BinaryToHexStrategy';
import { TwosComplementBinaryToFloatStrategy } from '../binaryConverter/strategy/TwosComplementBinaryToFloatStrategy';
import { UnsignedBinaryToFloatStrategy } from '../binaryConverter/strategy/UnsignedBinaryToFloatStrategy';
import { BinaryToBinaryStrategy } from '../binaryConverter/strategy/BinaryToBinaryStrategy';

import { HexConverter } from '../hexConverter/HexConverter';
import { HexToHexStrategy } from '../hexConverter/strategy/HexToHexStrategy';
import { TwosComplementHexToFloatStrategy } from '../hexConverter/strategy/TwosComplementHexToFloatStrategy';
import { UnsignedHexToFloatStrategy } from '../hexConverter/strategy/UnsignedHexToFloatStrategy';
import { HexToBinaryStrategy } from '../hexConverter/strategy/HexToBinaryStrategy';

export const signedBinaryConverters = new Converters(
  new BinaryConverter(new BinaryToHexStrategy()),
  new BinaryConverter(new TwosComplementBinaryToFloatStrategy()),
  new BinaryConverter(new BinaryToBinaryStrategy()),
);

export const unsignedBinaryConverters = new Converters(
  new BinaryConverter(new BinaryToHexStrategy()),
  new BinaryConverter(new UnsignedBinaryToFloatStrategy()),
  new BinaryConverter(new BinaryToBinaryStrategy()),
);

export const signedHexConverters = new Converters(
  new HexConverter(new HexToHexStrategy()),
  new HexConverter(new TwosComplementHexToFloatStrategy()),
  new HexConverter(new HexToBinaryStrategy()),
);

export const unsignedHexConverters = new Converters(
  new HexConverter(new HexToHexStrategy()),
  new HexConverter(new UnsignedHexToFloatStrategy()),
  new HexConverter(new HexToBinaryStrategy()),
);
