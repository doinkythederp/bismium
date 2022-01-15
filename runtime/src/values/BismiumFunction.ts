import BismiumObject from './BismiumObject';
import RootContext from '../RootContext';
import { Value } from '.';

export default class BismiumFunction extends BismiumObject {
  public constructor(
    rootContext: RootContext,
    private readonly callback: BismiumFunctionCallback,
    public readonly name = callback.name
  ) {
    super(rootContext);
  }

  public call(args: Value[]) {
    return Promise.resolve(
      this.callback({
        rootContext: this.rootContext,
        args
      })
    );
  }

  public override displayName = this.name
    ? `<function ${this.name}>`
    : '<function>';
}

export type BismiumFunctionCallback = (
  callbackInfo: BismiumCallbackInfo
) => Promise<Value> | Value;

export interface BismiumCallbackInfo {
  rootContext: RootContext;
  args: Value[];
}
