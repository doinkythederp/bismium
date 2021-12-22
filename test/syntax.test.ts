import NumberInterpreter from '../src/interpreters/NumberInterpreter';
import { NumberNode } from '../src/Node';
import * as Errors from '../src/util/errors';

describe(NumberInterpreter, () => {
  async function checkInterpretedValues(tests: {
    values: string[];
    targets: number[];
  }) {
    const results: Array<Promise<NumberNode>> = [];

    for (const value of tests.values) {
      results.push(new NumberInterpreter(new NumberNode(0)).run(value));
    }

    for (const [value, target] of (await Promise.all(results)).map(
      ({ value }, i) => [value, tests.targets[i]!] as const
    )) {
      expect(value).toBe(target);
    }
  }

  it('parses base 10 integers', async () => {
    await checkInterpretedValues({
      values: ['123', '999', '000', '01'],
      targets: [123, 999, 0, 1]
    });
  });

  it('parses base 10 floating point numbers', async () => {
    await checkInterpretedValues({
      values: ['123.45', '999.99', '.1', '000.001'],
      targets: [123.45, 999.99, 0.1, 0.001]
    });
  });

  it('parses hexadecimal integers', async () => {
    await checkInterpretedValues({
      values: ['0x123', '0xfff', '0x000', '0x01', '0xABCF'],
      targets: [0x123, 0xfff, 0, 0x01, 0xabcf]
    });
  });

  it('rejects bad characters', () => {
    for (const value of ['0xyz', '123f56', '1xabc', '123xyz']) {
      expect(async () => {
        await new NumberInterpreter(new NumberNode(0)).run(value);
      }).rejects.toBeInstanceOf(Errors.SyntaxError);
    }
  });
});
