import { BinaryToHexStrategy } from '../binaryConverter/strategy/BinaryToHexStrategy';
import { TwosComplementBinaryToFloatStrategy } from '../binaryConverter/strategy/TwosComplementBinaryToFloatStrategy';
import { UnsignedBinaryToFloatStrategy } from '../binaryConverter/strategy/UnsignedBinaryToFloatStrategy';
import { BinaryConverter } from '../binaryConverter/BinaryConverter';
import { Converters } from './Converters';

export const signedBinaryConverters = new Converters(
  new BinaryConverter(new TwosComplementBinaryToFloatStrategy()),
  new BinaryConverter(new BinaryToHexStrategy()),
);

export const unsignedBinaryConverters = new Converters(
  new BinaryConverter(new UnsignedBinaryToFloatStrategy()),
  new BinaryConverter(new BinaryToHexStrategy()),
);
