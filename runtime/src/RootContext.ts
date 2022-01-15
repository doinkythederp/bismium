import { Value } from './values';

export default class RootContext {
  public constructor(
    public readonly lib: Record<
      'string' | 'number' | 'object',
      Map<string, Value>
    >
  ) {}
}
