import { Converters } from './Converters';

import { BinaryConverter } from '../binaryConverter/BinaryConverter';
import { BinaryToHexStrategy } from '../binaryConverter/strategy/BinaryToHexStrategy';
import { TwosComplementBinaryToFloatStrategy } from '../binaryConverter/strategy/TwosComplementBinaryToFloatStrategy';
import { UnsignedBinaryToFloatStrategy } from '../binaryConverter/strategy/UnsignedBinaryToFloatStrategy';
import { BinaryToBinaryStrategy } from '../binaryConverter/strategy/BinaryToBinaryStrategy';

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
