import { PropertyAccessorNode, ValueInterpreter } from '../src';

describe(ValueInterpreter, () => {
  it('can parse variables', async () => {
    const node = await new ValueInterpreter().run('foobar');
    expect(node.target).toHaveProperty('name', 'foobar');
  });

  it('can parse variables with numbers in their names', async () => {
    const variableName = `foo${Math.round(Math.random() * 100_000)}`;
    const node = await new ValueInterpreter().run(variableName);
    expect(node.target).toHaveProperty('name', variableName);
  });

  it('can parse properties', async () => {
    const results: Array<Promise<void>> = [];
    for (let i = 0; i < 4; i++) {
      results.push(
        (async (type) => {
          let source = '';
          switch (type) {
            case ValueType.Variable:
              source += 'foobar';
              break;
            case ValueType.String:
              source += '"foobar"';
              break;
            case ValueType.Number:
              source += '123.456';
              break;
            case ValueType.Hex:
              source += '0x123abc';
              break;
          }

          const props = ['foo', 'bar'];
          source += props.map((prop) => `.${prop}`).join('');

          const node = await new ValueInterpreter().run(source);

          for (let i = 0; i < 2; i++) {
            const prop = node.props[i];
            expect(prop).toBeInstanceOf(PropertyAccessorNode);
            expect((prop as PropertyAccessorNode).prop).toBe(props[i]);
          }
        })(i)
      );
    }

    await Promise.all(results);
  });
});

enum ValueType {
  Variable,
  String,
  Number,
  Hex
}
