import NumberInterpreter from '../src/interpreters/NumberInterpreter';
import { NumberNode } from '../src/Node';
import createValueChecker from './createValueChecker';

describe(NumberInterpreter, () => {
  const createNumberNode = async (data: string) =>
    new NumberInterpreter().run(data);

  const checkValues = createValueChecker<NumberNode, number>(
    createNumberNode,
    (result, target) => expect(result.value).toBe(target)
  );

  const checkSourceLength = createValueChecker<NumberNode, number>(
    createNumberNode,
    (result, target) => expect(result.meta.sourceLength).toBe(target)
  );

  it('parses base 10 integers', async () => {
    await checkValues({
      values: ['123', '999', '000', '01'],
      targets: [123, 999, 0, 1]
    });
  });

  it('parses base 10 floating point numbers', async () => {
    await checkValues({
      values: ['123.45', '999.99', '.1', '000.001'],
      targets: [123.45, 999.99, 0.1, 0.001]
    });
  });

  it('parses hexadecimal integers', async () => {
    await checkValues({
      values: ['0x123', '0xfff', '0x000', '0x01', '0xABCF'],
      targets: [0x123, 0xfff, 0, 0x01, 0xabcf]
    });
  });

  it('ends on unexpected character', async () => {
    await checkValues({
      values: ['0x123)', '999)', '123 '],
      targets: [0x123, 999, 123]
    });
  });

  it('correctly calculates sourceLength', async () => {
    const values = ['123', '456.789', '0x123abc'];
    await checkSourceLength({
      values,
      targets: values.map((data) => data.length)
    });
  });
});
