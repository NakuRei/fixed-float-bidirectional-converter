import { BinaryToHexStrategy } from '../binaryConverter/strategy/BinaryToHexStrategy';
import { TwosComplementBinary2FloatStrategy } from '../binaryConverter/strategy/TwosComplementBinary2FloatStrategy';
import { UnsignedBinaryToFloatStrategy } from '../binaryConverter/strategy/UnsignedBinaryToFloatStrategy';
import { BinaryConverter } from '../binaryConverter/BinaryConverter';
import { Converters } from './Converters';

export const signedBinaryConverters = new Converters(
  new BinaryConverter(new TwosComplementBinary2FloatStrategy()),
  new BinaryConverter(new BinaryToHexStrategy()),
);

export const unsignedBinaryConverters = new Converters(
  new BinaryConverter(new UnsignedBinaryToFloatStrategy()),
  new BinaryConverter(new BinaryToHexStrategy()),
);
