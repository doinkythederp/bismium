import BismiumFunction from './BismiumFunction';
import BismiumObject from './BismiumObject';
import BismiumBoolean from './primitives/BismiumBoolean';
import BismiumNull from './primitives/BismiumNull';
import BismiumNumber from './primitives/BismiumNumber';
import BismiumString from './primitives/BismiumString';

export type Primitive =
  | BismiumBoolean
  | BismiumNull
  | BismiumNumber
  | BismiumString;

export type Value = BismiumFunction | BismiumObject | Primitive;

export type AsPrimitive<T extends boolean | null | number | string> =
  T extends boolean
    ? BismiumBoolean
    : T extends null
    ? BismiumNull
    : T extends number
    ? BismiumNumber
    : T extends string
    ? BismiumString
    : never;

export interface BaseValue {
  getProperty(key: string): Value | undefined;
  setProperty(key: string, value: Value): this;
  toJS(): unknown;
  displayName: string;
}
